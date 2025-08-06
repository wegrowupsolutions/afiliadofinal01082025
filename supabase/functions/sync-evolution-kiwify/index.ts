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

    console.log('🔄 Iniciando sincronização Evolution → Supabase (Multi-usuário)...')

    // 1. Buscar TODAS as instâncias da Evolution API
    const evolutionResponse = await fetch('https://evolution.serverwegrowup.com.br/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': '066327121bd64f8356c26e9edfa1799d',
        'Content-Type': 'application/json'
      }
    })

    if (!evolutionResponse.ok) {
      throw new Error(`Evolution API falhou: ${evolutionResponse.status}`)
    }

    const evolutionData = await evolutionResponse.json()
    console.log(`📊 ${evolutionData.length} instâncias encontradas na Evolution`)

    // 2. Buscar TODOS os usuários com instâncias cadastradas no Supabase
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
    let processedUsers = []

    // 3. Para cada instância da Evolution, sincronizar com usuário correspondente
    for (const evolutionItem of evolutionData) {
      const instance = evolutionItem.instance
      
      // Capturar nome da instância (flexível para instanceName ou name)
      const instanceName = instance.instanceName || instance.name
      
      if (!instanceName) {
        console.log('⚠️ Instância sem nome encontrada, pulando...')
        continue
      }

      // Encontrar usuário específico que possui esta instância (ISOLAMENTO)
      const user = users?.find(u => u["Nome da instancia da Evolution"] === instanceName)
      
      if (user) {
        console.log(`🔗 Sincronizando ${instanceName} para user ${user.user_id}`)
        
        // 4. Atualizar APENAS OS DADOS DESTE USUÁRIO ESPECÍFICO
        const updateData = {
          // Status de conexão
          is_connected: instance.status === 'open',
          connected_at: instance.status === 'open' ? new Date().toISOString() : null,
          disconnected_at: instance.status !== 'open' ? new Date().toISOString() : null,
          
          // Dados completos da Evolution (com fallbacks)
          evolution_instance_id: instance.instanceId || instance.id,
          evolution_profile_name: instance.profileName || instance.profile?.name,
          evolution_profile_picture_url: instance.profilePictureURL || instance.profile?.pictureUrl,
          evolution_profile_status: instance.profileStatus || instance.profile?.status,
          evolution_server_url: instance.serverUrl || instance.server?.url,
          evolution_api_key: instance.apikey || instance.apiKey,
          evolution_integration_data: instance.integration,
          evolution_raw_data: evolutionItem,
          evolution_last_sync: new Date().toISOString(),
          
          // Campos específicos
          remojid: instance.owner,
          evo_instance: instanceName
        }

        // ATUALIZAR APENAS ESTE USUÁRIO ESPECÍFICO (ISOLAMENTO GARANTIDO)
        const { error } = await supabase
          .from('kiwify')
          .update(updateData)
          .eq('user_id', user.user_id) // ← ISOLAMENTO: só afeta este usuário

        if (error) {
          console.error(`❌ Erro ao atualizar ${instanceName} (user: ${user.user_id}):`, error)
        } else {
          console.log(`✅ ${instanceName} sincronizado com sucesso (user: ${user.user_id})`)
          syncCount++
          processedUsers.push({
            user_id: user.user_id,
            instance_name: instanceName,
            status: instance.status
          })
        }
      } else {
        console.log(`⚠️ Instância ${instanceName} não tem usuário correspondente no banco`)
      }
    }

    console.log(`🎯 Sincronização concluída: ${syncCount} usuários atualizados`)

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronização multi-usuário completa`,
      total_evolution_instances: evolutionData.length,
      total_users_with_instances: users?.length || 0,
      synced_users: syncCount,
      processed_users: processedUsers
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro na sincronização multi-usuário:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})