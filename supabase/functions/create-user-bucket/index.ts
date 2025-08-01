import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string;
  user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { email, user_id }: RequestBody = await req.json()

    console.log(`Creating bucket for user: ${email} (${user_id})`)

    // Call the database function to create user bucket
    const { data: bucketName, error } = await supabase
      .rpc('create_user_bucket_by_email', {
        user_email: email,
        user_id: user_id
      })

    if (error) {
      console.error('Error creating bucket:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create user bucket', details: error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Bucket created successfully: ${bucketName}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        bucket_name: bucketName,
        message: `Bucket '${bucketName}' created for user ${email}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})