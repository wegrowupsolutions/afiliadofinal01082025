import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, instanceName, phoneNumber } = await req.json()
    console.log('User email:', user.email)
    console.log('Action:', action, 'Instance:', instanceName)

    switch (action) {
      case 'create':
        // Criar nova instância
        const { error: insertError } = await supabaseClient
          .from('evolution_instances')
          .insert({
            user_id: user.id,
            instance_name: instanceName,
            phone_number: phoneNumber,
            is_connected: false
          })
        
        if (insertError) {
          console.error('Error creating instance:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to create instance', details: insertError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Instance created successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'connect':
        // Marcar instância como conectada
        const { error: updateError } = await supabaseClient
          .from('evolution_instances')
          .update({
            is_connected: true,
            connected_at: new Date().toISOString(),
            phone_number: phoneNumber,
            disconnected_at: null
          })
          .eq('user_id', user.id)
          .eq('instance_name', instanceName)
        
        if (updateError) {
          console.error('Error updating instance:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update instance', details: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Instance connected successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'disconnect':
        // Marcar instância como desconectada
        const { error: disconnectError } = await supabaseClient
          .from('evolution_instances')
          .update({
            is_connected: false,
            disconnected_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('instance_name', instanceName)
        
        if (disconnectError) {
          console.error('Error disconnecting instance:', disconnectError)
          return new Response(
            JSON.stringify({ error: 'Failed to disconnect instance', details: disconnectError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Instance disconnected successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'list':
        // Listar instâncias do usuário
        const { data: instances, error: listError } = await supabaseClient
          .from('evolution_instances')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (listError) {
          console.error('Error listing instances:', listError)
          return new Response(
            JSON.stringify({ error: 'Failed to list instances', details: listError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ instances }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})