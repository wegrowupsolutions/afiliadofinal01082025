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

    console.log('🔄 Iniciando sincronização Evolution → Supabase...')

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

    // 2. Buscar usuários com instâncias cadastradas no Supabase
    const { data: users, error: usersError } = await supabase
      .from('kiwify')
      .select('user_id, "Nome da instancia da Evolution"')
      .not('"Nome da instancia da Evolution"', 'is', null)

    if (usersError) throw usersError

    let syncCount = 0

    // 3. Para cada instância da Evolution, sincronizar com usuário correspondente
    for (const evolutionItem of evolutionData) {
      const instance = evolutionItem.instance
      
      // Encontrar usuário que possui esta instância
      const user = users?.find(u => u["Nome da instancia da Evolution"] === instance.instanceName)
      
      if (user) {
        console.log(`🔗 Sincronizando ${instance.instanceName} para user ${user.user_id}`)
        
        // 4. Atualizar TODOS os dados da Evolution no Supabase
        const updateData = {
          // Status de conexão
          is_connected: instance.status === 'open',
          connected_at: instance.status === 'open' ? new Date().toISOString() : null,
          disconnected_at: instance.status !== 'open' ? new Date().toISOString() : null,
          
          // Dados completos da Evolution
          evolution_instance_id: instance.instanceId,
          evolution_profile_name: instance.profileName,
          evolution_profile_picture_url: instance.profilePictureURL,
          evolution_profile_status: instance.profileStatus,
          evolution_server_url: instance.serverUrl,
          evolution_api_key: instance.apikey,
          evolution_integration_data: instance.integration,
          evolution_raw_data: evolutionItem,
          evolution_last_sync: new Date().toISOString(),
          
          // Campos específicos
          remojid: instance.owner,
          evo_instance: instance.instanceName
        }

        const { error } = await supabase
          .from('kiwify')
          .update(updateData)
          .eq('user_id', user.user_id)

        if (error) {
          console.error(`❌ Erro ao atualizar ${instance.instanceName}:`, error)
        } else {
          console.log(`✅ ${instance.instanceName} sincronizado com sucesso`)
          syncCount++
        }
      } else {
        console.log(`⚠️ Instância ${instance.instanceName} não tem usuário correspondente`)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronização completa: ${syncCount}/${evolutionData.length} instâncias`,
      synced_instances: syncCount
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