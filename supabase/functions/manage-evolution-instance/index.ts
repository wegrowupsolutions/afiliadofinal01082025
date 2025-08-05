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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Usar service role key
    )

    const { action, instanceName, phoneNumber, userEmail } = await req.json()
    console.log('Received request:', { action, instanceName, userEmail })

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'userEmail is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar o usuário pelo email na tabela profiles
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single()

    if (profileError || !profileData) {
      console.error('Profile not found:', profileError)
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = profileData.id
    console.log('Found user:', userId, userEmail)

    switch (action) {
      case 'create':
        // Criar nova instância
        const { error: insertError } = await supabaseClient
          .from('evolution_instances')
          .insert({
            user_id: userId,
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

        console.log('Instance created successfully')
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
          .eq('user_id', userId)
          .eq('instance_name', instanceName)
        
        if (updateError) {
          console.error('Error updating instance:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update instance', details: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Instance connected successfully')
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
          .eq('user_id', userId)
          .eq('instance_name', instanceName)
        
        if (disconnectError) {
          console.error('Error disconnecting instance:', disconnectError)
          return new Response(
            JSON.stringify({ error: 'Failed to disconnect instance', details: disconnectError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Instance disconnected successfully')
        return new Response(
          JSON.stringify({ success: true, message: 'Instance disconnected successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'list':
        // Listar instâncias do usuário
        const { data: instances, error: listError } = await supabaseClient
          .from('evolution_instances')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (listError) {
          console.error('Error listing instances:', listError)
          return new Response(
            JSON.stringify({ error: 'Failed to list instances', details: listError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Instances listed successfully:', instances?.length || 0)
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