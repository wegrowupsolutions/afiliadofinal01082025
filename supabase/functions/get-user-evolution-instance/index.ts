import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('get-user-evolution-instance function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get request data
    const { userEmail } = await req.json()
    console.log('Looking for instances for user email:', userEmail);

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'User email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // First, get the user ID from kiwify table
    const { data: kiwifyUser, error: kiwifyError } = await supabaseClient
      .from('kiwify')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    if (kiwifyError) {
      console.error('Error fetching kiwify user:', kiwifyError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user data', details: kiwifyError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!kiwifyUser) {
      console.log('No kiwify user found for email:', userEmail);
      return new Response(
        JSON.stringify({ connectedInstance: null }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Found kiwify user:', kiwifyUser);

    // Now get the evolution instance for this user
    const { data: evolutionInstances, error: evolutionError } = await supabaseClient
      .from('evolution_instances')
      .select('instance_name, phone_number, is_connected, connected_at')
      .eq('user_id', kiwifyUser.id.toString())
      .eq('is_connected', true)
      .order('connected_at', { ascending: false })
      .limit(1);

    if (evolutionError) {
      console.error('Error fetching evolution instances:', evolutionError);
      return new Response(
        JSON.stringify({ error: 'Error fetching evolution instances', details: evolutionError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Evolution instances found:', evolutionInstances);

    const connectedInstance = evolutionInstances && evolutionInstances.length > 0 ? evolutionInstances[0] : null;

    return new Response(
      JSON.stringify({ connectedInstance }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});