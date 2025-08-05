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
      console.error('Missing userEmail in request')
      return new Response(
        JSON.stringify({ error: 'userEmail is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!instanceName && action !== 'list') {
      console.error('Missing instanceName in request')
      return new Response(
        JSON.stringify({ error: 'instanceName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar o usuário pelo email na tabela profiles
    console.log('Searching for profile with email:', userEmail)
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, phone, created_at, updated_at')
      .eq('email', userEmail)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'User profile not found', 
          details: profileError.message,
          email: userEmail 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profileData) {
      console.error('No profile data found for email:', userEmail)
      return new Response(
        JSON.stringify({ error: 'User profile not found', email: userEmail }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = profileData.id
    console.log('Found user profile:', { 
      id: userId, 
      email: profileData.email, 
      full_name: profileData.full_name,
      phone: profileData.phone 
    })

    switch (action) {
      case 'create':
        console.log('Creating instance for user:', userId, 'with name:', instanceName)
        
        // Verificar se já existe uma instância com esse nome para o usuário
        const { data: existingInstance, error: checkError } = await supabaseClient
          .from('evolution_instances')
          .select('instance_name')
          .eq('user_id', userId)
          .eq('instance_name', instanceName)
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing instance:', checkError)
          return new Response(
            JSON.stringify({ error: 'Failed to check existing instances', details: checkError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (existingInstance) {
          console.log('Instance already exists:', existingInstance)
          return new Response(
            JSON.stringify({ error: 'Instance name already exists for this user' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Criar nova instância
        console.log('Inserting new instance:', { user_id: userId, instance_name: instanceName })
        const { error: insertError } = await supabaseClient
          .from('evolution_instances')
          .insert({
            user_id: userId,
            instance_name: instanceName,
            phone_number: phoneNumber || profileData.phone, // Usar telefone do perfil se não fornecido
            is_connected: false
          })
        
        if (insertError) {
          console.error('Error creating instance:', insertError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create instance', 
              details: insertError.message,
              code: insertError.code,
              hint: insertError.hint
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Instance created successfully for user:', profileData.full_name || profileData.email)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Instance created successfully',
            user: {
              name: profileData.full_name || profileData.email,
              email: profileData.email
            }
          }),
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

        console.log('Instance connected successfully for user:', profileData.full_name || profileData.email)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Instance connected successfully',
            user: {
              name: profileData.full_name || profileData.email,
              email: profileData.email
            },
            instance: {
              name: instanceName,
              phone: phoneNumber
            }
          }),
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
        // Listar instâncias do usuário com dados completos
        const { data: instances, error: listError } = await supabaseClient
          .from('evolution_instances')
          .select(`
            *,
            profiles!inner(
              email,
              full_name,
              phone
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (listError) {
          console.error('Error listing instances:', listError)
          return new Response(
            JSON.stringify({ error: 'Failed to list instances', details: listError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Instances listed successfully for user:', profileData.full_name || profileData.email, '- Count:', instances?.length || 0)
        return new Response(
          JSON.stringify({ 
            instances,
            user: {
              name: profileData.full_name || profileData.email,
              email: profileData.email,
              phone: profileData.phone
            }
          }),
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