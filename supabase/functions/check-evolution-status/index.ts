import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('check-evolution-status function called');
  
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
    const { userEmail, instanceName } = await req.json()
    console.log('Checking status for:', { userEmail, instanceName });

    if (!userEmail || !instanceName) {
      return new Response(
        JSON.stringify({ error: 'User email and instance name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check instance status via Evolution API
    console.log('Checking instance status with Evolution API...');
    
    try {
      // Check if instance exists and get status
      const statusResponse = await fetch(`https://webhook.serverwegrowup.com.br/webhook/instance/${instanceName}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      let instanceStatus = null;
      if (statusResponse.ok) {
        instanceStatus = await statusResponse.json();
        console.log('Instance status:', instanceStatus);
      }

      // Get webhook information
      const webhookResponse = await fetch(`https://webhook.serverwegrowup.com.br/webhook/instance/${instanceName}/webhook`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      let webhookInfo = null;
      if (webhookResponse.ok) {
        webhookInfo = await webhookResponse.json();
        console.log('Webhook info:', webhookInfo);
      }

      // Get database status
      const { data: kiwifyUser, error: kiwifyError } = await supabaseClient
        .from('kiwify')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (kiwifyError) {
        console.error('Error fetching kiwify user:', kiwifyError);
      }

      let dbInstanceStatus = null;
      if (kiwifyUser) {
        const { data: evolutionInstance, error: evolutionError } = await supabaseClient
          .from('evolution_instances')
          .select('*')
          .eq('user_id', kiwifyUser.id.toString())
          .eq('instance_name', instanceName)
          .maybeSingle();

        if (!evolutionError && evolutionInstance) {
          dbInstanceStatus = evolutionInstance;
          console.log('Database instance status:', dbInstanceStatus);
        }
      }

      const result = {
        instanceName,
        userEmail,
        evolutionApi: {
          status: instanceStatus,
          webhooks: webhookInfo,
          available: statusResponse.ok
        },
        database: {
          status: dbInstanceStatus,
          kiwifyUserId: kiwifyUser?.id || null
        },
        webhookUrls: {
          messages: `https://webhook.serverwegrowup.com.br/webhook/afiliado_mensagem/${instanceName}`,
          status: `https://webhook.serverwegrowup.com.br/webhook/afiliado_status/${instanceName}`,
          qrcode: `https://webhook.serverwegrowup.com.br/webhook/afiliado_qrcode/${instanceName}`
        },
        checkTime: new Date().toISOString()
      };

      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (apiError) {
      console.error('Error checking Evolution API:', apiError);
      
      // Return what we can get from database only
      const { data: kiwifyUser } = await supabaseClient
        .from('kiwify')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      let dbInstanceStatus = null;
      if (kiwifyUser) {
        const { data: evolutionInstance } = await supabaseClient
          .from('evolution_instances')
          .select('*')
          .eq('user_id', kiwifyUser.id.toString())
          .eq('instance_name', instanceName)
          .maybeSingle();

        dbInstanceStatus = evolutionInstance;
      }

      const result = {
        instanceName,
        userEmail,
        evolutionApi: {
          status: null,
          webhooks: null,
          available: false,
          error: apiError.message
        },
        database: {
          status: dbInstanceStatus,
          kiwifyUserId: kiwifyUser?.id || null
        },
        webhookUrls: {
          messages: `https://webhook.serverwegrowup.com.br/webhook/afiliado_mensagem/${instanceName}`,
          status: `https://webhook.serverwegrowup.com.br/webhook/afiliado_status/${instanceName}`,
          qrcode: `https://webhook.serverwegrowup.com.br/webhook/afiliado_qrcode/${instanceName}`
        },
        checkTime: new Date().toISOString()
      };

      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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