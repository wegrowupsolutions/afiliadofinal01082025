import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instanceName } = await req.json();
    
    if (!instanceName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Instance name required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client to get configurations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Evolution API configurations
    const { data: configs, error: configError } = await supabase
      .from('system_configurations')
      .select('key, value')
      .in('key', ['evolution_api_url', 'evolution_api_key']);

    if (configError) {
      console.error('Error fetching configurations:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get API configurations' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const evolutionApiUrl = configs?.find(c => c.key === 'evolution_api_url')?.value;
    const evolutionApiKey = configs?.find(c => c.key === 'evolution_api_key')?.value;

    if (!evolutionApiUrl || !evolutionApiKey) {
      console.error('Missing Evolution API configurations');
      return new Response(
        JSON.stringify({ success: false, error: 'Evolution API not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔌 Starting Evolution API logout/delete for instance: ${instanceName}`);

    // 1. LOGOUT from Evolution API
    const logoutResponse = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': evolutionApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!logoutResponse.ok) {
      console.warn(`⚠️ Evolution logout failed: ${logoutResponse.status} ${logoutResponse.statusText}`);
    } else {
      console.log(`✅ Evolution logout successful for: ${instanceName}`);
    }

    // 2. DELETE from Evolution API
    const deleteResponse = await fetch(`${evolutionApiUrl}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': evolutionApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!deleteResponse.ok) {
      console.warn(`⚠️ Evolution delete failed: ${deleteResponse.status} ${deleteResponse.statusText}`);
    } else {
      console.log(`✅ Evolution delete successful for: ${instanceName}`);
    }

    console.log(`🏁 Evolution API cleanup completed for instance: ${instanceName}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in evolution-logout-delete function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});