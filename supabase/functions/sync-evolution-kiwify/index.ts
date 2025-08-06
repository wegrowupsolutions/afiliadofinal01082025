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

    console.log('🔄 Buscando dados da Evolution API...')

    // 1. Buscar dados da Evolution API usando fetchInstances
    const evolutionResponse = await fetch('https://evolution.serverwegrowup.com.br/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': '066327121bd64f8356c26e9edfa1799d',
        'Content-Type': 'application/json'
      }
    })

    if (!evolutionResponse.ok) {
      const errorText = await evolutionResponse.text()
      console.error('❌ Erro Evolution API:', errorText)
      throw new Error(`Evolution API erro ${evolutionResponse.status}: ${errorText}`)
    }

    const evolutionData = await evolutionResponse.json()
    console.log('📊 Evolution data recebido:', JSON.stringify(evolutionData, null, 2))

    // 2. Verificar se evolutionData é array ou objeto
    let instances = []
    if (Array.isArray(evolutionData)) {
      instances = evolutionData
    } else if (evolutionData.instances && Array.isArray(evolutionData.instances)) {
      instances = evolutionData.instances
    } else if (evolutionData.instance) {
      instances = [evolutionData]
    } else {
      console.log('⚠️ Formato inesperado dos dados da Evolution:', evolutionData)
      return new Response(JSON.stringify({
        success: false,
        error: 'Formato de dados Evolution inesperado'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`📊 ${instances.length} instâncias encontradas na Evolution`)

    // 3. Buscar usuários com instâncias na tabela kiwify
    const { data: users, error: usersError } = await supabase
      .from('kiwify')
      .select('user_id, "Nome da instancia da Evolution"')
      .not('"Nome da instancia da Evolution"', 'is', null)

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      throw usersError
    }

    console.log(`👥 ${users?.length || 0} usuários com instâncias encontrados`)

    let syncCount = 0
    let processedInstances = []

    // 4. Processar cada instância
    for (const instanceItem of instances) {
      const instance = instanceItem.instance || instanceItem
      
      // Extrair nome da instância de diferentes formatos possíveis
      const instanceName = instance.instanceName || instance.name || instance.id
      
      if (!instanceName) {
        console.log('⚠️ Instância sem nome, pulando...')
        continue
      }

      console.log(`🔍 Processando instância: ${instanceName}`)
      console.log(`📋 Dados da instância:`, JSON.stringify(instance, null, 2))

      // Encontrar usuário correspondente
      const user = users?.find(u => u["Nome da instancia da Evolution"] === instanceName)
      
      if (user) {
        console.log(`✅ Match encontrado: ${instanceName} → User ${user.user_id}`)
        
        // Preparar dados para atualização
        const isConnected = instance.connectionStatus === 'open' || instance.status === 'open' || instance.state === 'open'
        const updateData = {
          // Status de conexão
          is_connected: isConnected,
          connected_at: isConnected ? new Date().toISOString() : null,
          disconnected_at: !isConnected ? new Date().toISOString() : null,
          
          // Dados da Evolution
          evolution_instance_id: instance.instanceId || instance.id || instance.key,
          evolution_profile_name: instance.profileName || instance.profile?.name || instance.displayName,
          evolution_profile_picture_url: instance.profilePictureURL || instance.profile?.pictureUrl || instance.profilePicture,
          evolution_profile_status: instance.profileStatus || instance.profile?.status || instance.status,
          evolution_server_url: instance.serverUrl || instance.server || 'https://evolution.serverwegrowup.com.br',
          evolution_api_key: instance.apikey || instance.apiKey || '066327121bd64f8356c26e9edfa1799d',
          evolution_integration_data: instance.integration || null,
          evolution_raw_data: instanceItem,
          evolution_last_sync: new Date().toISOString(),
          
          // Campos específicos
          remojid: instance.owner || instance.phone || instance.number,
          evo_instance: instanceName
        }

        console.log(`📝 Dados para atualização:`, JSON.stringify(updateData, null, 2))

        // Atualizar usuário específico
        const { error: updateError } = await supabase
          .from('kiwify')
          .update(updateData)
          .eq('user_id', user.user_id)

        if (updateError) {
          console.error(`❌ Erro ao atualizar ${instanceName}:`, updateError)
        } else {
          console.log(`✅ ${instanceName} atualizado com sucesso para user ${user.user_id}`)
          syncCount++
          processedInstances.push({
            instance_name: instanceName,
            user_id: user.user_id,
            status: instance.connectionStatus || instance.status || instance.state || 'unknown'
          })
        }
      } else {
        console.log(`⚠️ Nenhum usuário encontrado para instância: ${instanceName}`)
        console.log(`📋 Usuários disponíveis:`, users?.map(u => u["Nome da instancia da Evolution"]))
      }
    }

    const result = {
      success: true,
      message: `Sincronização concluída: ${syncCount}/${instances.length}`,
      total_instances: instances.length,
      synced_count: syncCount,
      processed_instances: processedInstances
    }

    console.log('🎯 Resultado final:', JSON.stringify(result, null, 2))

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro na sincronização:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})