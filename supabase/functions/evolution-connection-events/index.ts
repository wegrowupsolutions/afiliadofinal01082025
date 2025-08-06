import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EvolutionEvent {
  event: string;
  instance: {
    instanceName: string;
    status: string;
  };
  data: {
    remoteJid?: string;
    displayName?: string;
    profilePicUrl?: string;
  };
  server?: {
    id: string;
    url: string;
  };
}

serve(async (req) => {
  console.log('🚀 Evolution Connection Events webhook called');
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body: EvolutionEvent;
    try {
      const text = await req.text();
      console.log('📝 Raw request body:', text);
      body = JSON.parse(text);
    } catch (error) {
      console.error('❌ Error parsing request body:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON body',
        details: error.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📋 Parsed event data:', JSON.stringify(body, null, 2));

    // Process different event types
    if (body.event === 'CONNECTION_UPDATE') {
      await handleConnectionUpdate(body);
    } else if (body.event === 'QRCODE_UPDATED') {
      await handleQrCodeUpdate(body);
    } else {
      console.log('ℹ️ Unhandled event type:', body.event);
    }

    return new Response(JSON.stringify({ 
      success: true,
      event: body.event,
      instance: body.instance?.instanceName,
      message: 'Event processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleConnectionUpdate(event: EvolutionEvent) {
  console.log('🔗 Processing CONNECTION_UPDATE event');
  console.log('📊 Event details:', {
    instanceName: event.instance?.instanceName,
    status: event.instance?.status,
    remoteJid: event.data?.remoteJid
  });

  const instanceName = event.instance?.instanceName;
  const status = event.instance?.status;
  const remoteJid = event.data?.remoteJid;

  if (!instanceName) {
    console.error('❌ Missing instanceName in event');
    return;
  }

  // Check if connection was established
  if (status === 'open' || status === 'connected') {
    console.log('✅ Instance connected, updating database');

    try {
      // First, find the user by instance name
      const { data: kiwifyData, error: kiwifyError } = await supabase
        .from('kiwify')
        .select('user_id, email')
        .eq('Nome da instancia da Evolution', instanceName)
        .maybeSingle();

      if (kiwifyError) {
        console.error('❌ Error finding user by instance name:', kiwifyError);
        return;
      }

      if (!kiwifyData) {
        console.error('❌ No user found for instance:', instanceName);
        return;
      }

      console.log('👤 Found user:', {
        userId: kiwifyData.user_id,
        email: kiwifyData.email,
        instanceName
      });

      // Call mark_instance_connected function
      const { data: markResult, error: markError } = await supabase
        .rpc('mark_instance_connected', {
          p_user_id: kiwifyData.user_id,
          p_instance_name: instanceName,
          p_phone_number: remoteJid
        });

      if (markError) {
        console.error('❌ Error calling mark_instance_connected:', markError);
        return;
      }

      console.log('✅ Successfully marked instance as connected');
      console.log('📊 Mark result:', markResult);

    } catch (error) {
      console.error('❌ Error in handleConnectionUpdate:', error);
    }
  } else {
    console.log('ℹ️ Connection status not "open" or "connected":', status);
  }
}

async function handleQrCodeUpdate(event: EvolutionEvent) {
  console.log('📱 Processing QRCODE_UPDATED event');
  console.log('📊 Event details:', {
    instanceName: event.instance?.instanceName,
    status: event.instance?.status
  });

  // QR Code updates don't require database changes
  // This is just for logging and potential future enhancements
}