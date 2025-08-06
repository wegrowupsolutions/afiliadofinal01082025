import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  console.log('🔄 Evolution Status Sync job started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let syncedCount = 0;
    let errors: string[] = [];

    // Get all instances that need synchronization
    const { data: instances, error: instancesError } = await supabase
      .from('kiwify')
      .select('id, user_id, email, "Nome da instancia da Evolution", is_connected')
      .not('Nome da instancia da Evolution', 'is', null);

    if (instancesError) {
      console.error('❌ Error fetching instances:', instancesError);
      throw instancesError;
    }

    console.log(`📊 Found ${instances?.length || 0} instances to check`);

    for (const instance of instances || []) {
      try {
        // Check instance status with Evolution API
        const statusResult = await checkEvolutionInstanceStatus(instance['Nome da instancia da Evolution']);
        
        if (statusResult.connected !== instance.is_connected) {
          console.log(`🔄 Updating instance ${instance['Nome da instancia da Evolution']} status from ${instance.is_connected} to ${statusResult.connected}`);
          
          const { error: updateError } = await supabase
            .from('kiwify')
            .update({
              is_connected: statusResult.connected,
              connected_at: statusResult.connected ? new Date().toISOString() : null,
              disconnected_at: !statusResult.connected ? new Date().toISOString() : null,
              remojid: statusResult.phoneNumber || instance.remojid
            })
            .eq('id', instance.id);

          if (updateError) {
            console.error(`❌ Error updating instance ${instance['Nome da instancia da Evolution']}:`, updateError);
            errors.push(`Instance ${instance['Nome da instancia da Evolution']}: ${updateError.message}`);
          } else {
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error checking instance ${instance['Nome da instancia da Evolution']}:`, error);
        errors.push(`Instance ${instance['Nome da instancia da Evolution']}: ${error.message}`);
      }
    }

    // Clean up old unlinked instances
    const { data: unlinkResult, error: unlinkError } = await supabase
      .rpc('sync_unlinked_instances');

    if (unlinkError) {
      console.error('❌ Error syncing unlinked instances:', unlinkError);
      errors.push(`Unlinked sync: ${unlinkError.message}`);
    } else {
      console.log(`✅ Synced ${unlinkResult} unlinked instances`);
      syncedCount += unlinkResult || 0;
    }

    console.log(`✅ Sync completed. Updated ${syncedCount} instances. Errors: ${errors.length}`);

    return new Response(JSON.stringify({
      success: true,
      syncedCount,
      errors,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in sync job:', error);
    return new Response(JSON.stringify({
      error: 'Sync job failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function checkEvolutionInstanceStatus(instanceName: string): Promise<{
  connected: boolean;
  phoneNumber?: string;
}> {
  try {
    // Get webhook URL from configurations
    const { data: config, error: configError } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'webhook_confirma')
      .maybeSingle();

    if (configError || !config) {
      console.error('❌ Error getting webhook config:', configError);
      return { connected: false };
    }

    const response = await fetch(config.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: instanceName
      })
    });

    if (!response.ok) {
      console.error(`❌ HTTP error ${response.status} for instance ${instanceName}`);
      return { connected: false };
    }

    const data = await response.json();
    console.log(`📊 Status response for ${instanceName}:`, data);

    // Parse response based on Evolution API format
    if (data.status === 'positivo' || data.connected === true) {
      return {
        connected: true,
        phoneNumber: data.phoneNumber || data.remoteJid
      };
    }

    return { connected: false };

  } catch (error) {
    console.error(`❌ Error checking status for ${instanceName}:`, error);
    return { connected: false };
  }
}