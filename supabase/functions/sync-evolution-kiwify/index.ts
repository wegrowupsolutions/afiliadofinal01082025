import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Pegar dados do request se enviados (instância específica)
    let requestData = null
    try {
      requestData = await req.json()
    } catch {
      // Sem dados no request, buscar todas as instâncias
    }

    console.log('🔄 Iniciando sincronização Evolution → Kiwify...', requestData)

    // 1. Buscar todas as instâncias da Evolution API
    const evolutionResponse = await fetch('https://evolution.serverwegrowup.com.br/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': '066327121bd64f8356c26e9edfa1799d',
        'Content-Type': 'application/json'
      }
    })

    if (!evolutionResponse.ok) {
      throw new Error(`Evolution API erro: ${evolutionResponse.status}`)
    }

    const evolutionData = await evolutionResponse.json()
    console.log('📊 Dados Evolution recebidos:', evolutionData)

    // 2. Processar dados da Evolution
    let instances = []
    if (Array.isArray(evolutionData)) {
      instances = evolutionData
    } else if (evolutionData.instances) {
      instances = evolutionData.instances
    } else if (evolutionData.instance) {
      instances = [evolutionData]
    } else {
      console.error('❌ Formato inválido da Evolution API:', evolutionData)
      throw new Error('Formato de resposta Evolution inválido')
    }

    console.log(`📊 ${instances.length} instâncias encontradas`)

    // 3. Buscar usuários na tabela kiwify
    const { data: users, error: usersError } = await supabase
      .from('kiwify')
      .select('user_id, "Nome da instancia da Evolution"')
      .not('"Nome da instancia da Evolution"', 'is', null)

    if (usersError) {
      console.error('❌ Erro buscar usuários:', usersError)
      throw usersError
    }

    console.log(`👥 ${users?.length || 0} usuários encontrados`)

    let syncCount = 0
    const processedInstances = []

    // 4. Para cada instância, sincronizar com usuário correspondente
    for (const instanceItem of instances) {
      const instance = instanceItem.instance || instanceItem
      
      // Extrair nome da instância
      const instanceName = instance.instanceName || instance.name || instance.id
      
      if (!instanceName) {
        console.log('⚠️ Instância sem nome, pulando...')
        continue
      }

      console.log(`🔍 Processando: ${instanceName}`)

      // Buscar usuário correspondente
      const matchedUser = users?.find(u => 
        u["Nome da instancia da Evolution"] === instanceName
      )

      if (matchedUser) {
        console.log(`✅ Match: ${instanceName} → User ${matchedUser.user_id}`)

        // Para instância específica, buscar dados detalhados
        let instanceDetails = instance
        
        // Se temos o nome da instância, buscar detalhes específicos
        try {
          const detailResponse = await fetch(`https://evolution.serverwegrowup.com.br/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: {
              'apikey': '066327121bd64f8356c26e9edfa1799d',
              'Content-Type': 'application/json'
            }
          })
          
          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            console.log(`📋 Detalhes da instância ${instanceName}:`, detailData)
            
            // Merge dos dados se disponível
            if (detailData.instance) {
              instanceDetails = { ...instance, ...detailData.instance }
            }
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar detalhes de ${instanceName}:`, error.message)
          // Continuar com dados básicos
        }

        // Preparar dados para update
        const updateData = {
          // Status de conexão
          is_connected: instanceDetails.connectionStatus === 'open' || instanceDetails.status === 'open' || instanceDetails.state === 'open',
          connected_at: (instanceDetails.connectionStatus === 'open' || instanceDetails.status === 'open' || instanceDetails.state === 'open') 
            ? new Date().toISOString() : null,
          disconnected_at: (instanceDetails.connectionStatus !== 'open' && instanceDetails.status !== 'open' && instanceDetails.state !== 'open') 
            ? new Date().toISOString() : null,
          
          // Dados da Evolution
          evolution_instance_id: instanceDetails.instanceId || instanceDetails.id || instanceName,
          evolution_profile_name: instanceDetails.profileName || instanceDetails.profile?.name || instanceDetails.displayName,
          evolution_profile_picture_url: instanceDetails.profilePictureURL || instanceDetails.profile?.pictureUrl,
          evolution_profile_status: instanceDetails.profileStatus || instanceDetails.profile?.status,
          evolution_server_url: instanceDetails.serverUrl || 'https://evolution.serverwegrowup.com.br',
          evolution_api_key: instanceDetails.apikey || instanceDetails.apiKey || '066327121bd64f8356c26e9edfa1799d',
          evolution_integration_data: instanceDetails.integration || null,
          evolution_raw_data: instanceItem,
          evolution_last_sync: new Date().toISOString(),
          
          // Campos específicos
          remojid: instanceDetails.owner || instanceDetails.phone,
          evo_instance: instanceName
        }

        console.log(`📝 Atualizando user ${matchedUser.user_id}:`, updateData)

        // Atualizar dados do usuário
        const { error: updateError } = await supabase
          .from('kiwify')
          .update(updateData)
          .eq('user_id', matchedUser.user_id)

        if (updateError) {
          console.error(`❌ Erro update ${instanceName}:`, updateError)
        } else {
          console.log(`✅ ${instanceName} sincronizado com sucesso`)
          syncCount++
          processedInstances.push({
            instance_name: instanceName,
            user_id: matchedUser.user_id,
            status: instanceDetails.connectionStatus || instanceDetails.status || instanceDetails.state
          })
        }
      } else {
        console.log(`⚠️ Nenhum usuário para instância: ${instanceName}`)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronização completa: ${syncCount}/${instances.length}`,
      synced_count: syncCount,
      processed_instances: processedInstances
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro na sincronização:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})