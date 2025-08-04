import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('test-webhook-connections function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const endpoints = [
      {
        name: 'envia_mensagem_afiliado',
        url: 'https://webhook.serverwegrowup.com.br/webhook/envia_mensagem_afiliado',
        method: 'POST',
        testPayload: { test: true, instanceName: 'test' }
      },
      {
        name: 'pausa_bot_afiliado',
        url: 'https://webhook.serverwegrowup.com.br/webhook/pausa_bot_afiliado',
        method: 'POST',
        testPayload: { test: true, instanceName: 'test' }
      },
      {
        name: 'inicia_bot_afiliado',
        url: 'https://webhook.serverwegrowup.com.br/webhook/inicia_bot_afiliado',
        method: 'POST',
        testPayload: { test: true, instanceName: 'test' }
      },
      {
        name: 'confirma_afiliado',
        url: 'https://webhook.serverwegrowup.com.br/webhook/confirma_afiliado',
        method: 'POST',
        testPayload: { test: true, instanceName: 'test' }
      },
      {
        name: 'instancia_evolution_afiliado',
        url: 'https://webhook.serverwegrowup.com.br/webhook/instancia_evolution_afiliado',
        method: 'POST',
        testPayload: { test: true, instanceName: 'test' }
      },
      {
        name: 'atualizar_qr_code_afiliado',
        url: 'https://webhook.serverwegrowup.com.br/webhook/atualizar_qr_code_afiliado',
        method: 'POST',
        testPayload: { test: true, instanceName: 'test' }
      }
    ];

    console.log('Testing', endpoints.length, 'endpoints...');

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        console.log(`Testing endpoint: ${endpoint.name}`);
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(endpoint.testPayload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          const responseTime = Date.now();
          let responseData = null;
          let contentType = response.headers.get('content-type') || '';

          try {
            if (contentType.includes('application/json')) {
              responseData = await response.json();
            } else {
              responseData = await response.text();
            }
          } catch (parseError) {
            console.log(`Could not parse response for ${endpoint.name}:`, parseError);
            responseData = 'Could not parse response';
          }

          console.log(`${endpoint.name} - Status: ${response.status}, Response:`, responseData);

          return {
            name: endpoint.name,
            url: endpoint.url,
            status: response.status,
            ok: response.ok,
            responseTime: responseTime,
            contentType: contentType,
            response: responseData,
            error: null,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error testing ${endpoint.name}:`, error);
          return {
            name: endpoint.name,
            url: endpoint.url,
            status: null,
            ok: false,
            responseTime: null,
            contentType: null,
            response: null,
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      })
    );

    const endpointResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: endpoints[index].name,
          url: endpoints[index].url,
          status: null,
          ok: false,
          responseTime: null,
          contentType: null,
          response: null,
          error: result.reason?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    });

    const summary = {
      totalEndpoints: endpoints.length,
      activeEndpoints: endpointResults.filter(r => r.ok).length,
      failedEndpoints: endpointResults.filter(r => !r.ok).length,
      testCompletedAt: new Date().toISOString()
    };

    console.log('Test completed. Summary:', summary);

    return new Response(
      JSON.stringify({
        summary,
        results: endpointResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in webhook test:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        summary: {
          totalEndpoints: 0,
          activeEndpoints: 0,
          failedEndpoints: 0,
          testCompletedAt: new Date().toISOString()
        },
        results: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});