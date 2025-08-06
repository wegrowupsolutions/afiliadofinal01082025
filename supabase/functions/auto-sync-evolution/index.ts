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

    console.log('🔄 Iniciando sincronização automática global...', new Date().toISOString())

    // Chamar a função de sincronização principal
    const syncResponse = await supabase.functions.invoke('sync-evolution-kiwify', {
      body: { 
        automatic: true,
        source: 'auto-sync',
        timestamp: new Date().toISOString()
      }
    })

    if (syncResponse.error) {
      console.error('❌ Erro na sincronização automática:', syncResponse.error)
      throw syncResponse.error
    }

    const result = syncResponse.data

    // Log do resultado
    console.log('✅ Sincronização automática concluída:', result)

    // Salvar log da sincronização
    const { error: logError } = await supabase
      .from('system_configurations')
      .upsert({
        key: 'last_auto_sync',
        value: JSON.stringify({
          timestamp: new Date().toISOString(),
          result: result,
          source: 'auto-sync-cron'
        }),
        description: 'Último resultado da sincronização automática'
      })

    if (logError) {
      console.error('⚠️ Erro ao salvar log:', logError)
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Sincronização automática executada com sucesso',
      result: result,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro na sincronização automática:', error)
    
    // Salvar erro no log
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      
      await supabase
        .from('system_configurations')
        .upsert({
          key: 'last_auto_sync_error',
          value: JSON.stringify({
            timestamp: new Date().toISOString(),
            error: error.message,
            source: 'auto-sync-cron'
          }),
          description: 'Último erro da sincronização automática'
        })
    } catch (logError) {
      console.error('⚠️ Erro ao salvar log de erro:', logError)
    }

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