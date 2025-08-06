import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando sincronização de dados Evolution para tabela kiwify');

    // 1. Buscar configurações da Evolution API
    const { data: configData, error: configError } = await supabase
      .from('system_configurations')
      .select('key, value')
      .in('key', ['evolution_api_url', 'evolution_api_key'])

    if (configError) {
      throw new Error(`Erro ao buscar configurações: ${configError.message}`)
    }

    const config = configData.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, string>)

    if (!config.evolution_api_url || !config.evolution_api_key) {
      throw new Error('Configurações da Evolution API não encontradas')
    }

    console.log('📡 Fazendo requisição para Evolution API...');

    // 2. Buscar dados das instâncias da Evolution API
    const response = await fetch(`${config.evolution_api_url}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': config.evolution_api_key,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Erro na Evolution API: ${response.status} - ${response.statusText}`)
    }

    const evolutionData = await response.json()
    console.log(`📊 Recebidos dados de ${evolutionData.length} instâncias da Evolution`);

    // 3. Processar cada instância e atualizar dados na kiwify
    let successCount = 0
    let errorCount = 0
    const processedInstances: string[] = []

    for (const instanceData of evolutionData) {
      try {
        const instance = instanceData.instance

        if (!instance?.instanceName) {
          console.warn('⚠️ Instância sem nome, pulando:', instanceData)
          continue
        }

        // 4. Preparar dados para atualizar na kiwify (apenas campos evolution_*)
        const updateData = {
          evolution_instance_id: instance.instanceId,
          evolution_profile_name: instance.profileName,
          evolution_profile_picture_url: instance.profilePictureURL,
          evolution_profile_status: instance.profileStatus,
          evolution_server_url: instance.serverUrl,
          evolution_api_key: instance.apikey,
          evolution_integration_data: instance.integration || null,
          evolution_raw_data: instanceData,
          evolution_last_sync: new Date().toISOString()
        }

        // 5. Atualizar registro existente na kiwify por nome da instância
        const { error: updateError } = await supabase
          .from('kiwify')
          .update(updateData)
          .eq('Nome da instancia da Evolution', instance.instanceName)

        if (updateError) {
          console.error(`❌ Erro ao atualizar instância ${instance.instanceName}:`, updateError)
          errorCount++
        } else {
          console.log(`✅ Instância ${instance.instanceName} atualizada com sucesso`)
          successCount++
          processedInstances.push(instance.instanceName)
        }

      } catch (error) {
        console.error('❌ Erro ao processar instância:', error)
        errorCount++
      }
    }

    const result = {
      success: true,
      message: 'Sincronização Evolution concluída',
      total_instances: evolutionData.length,
      success_count: successCount,
      error_count: errorCount,
      processed_instances: processedInstances
    }

    console.log('📈 Resultado da sincronização:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro na sincronização Evolution:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})