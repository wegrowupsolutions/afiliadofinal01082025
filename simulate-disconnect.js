// Simular desconexão da instância do usuário viniciushtx@hotmail.com
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ufcarzzouvxgqljqxdnc.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY2FyenpvdXZ4Z3FsanF4ZG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NzU5NTMsImV4cCI6MjA2OTE1MTk1M30.wurxO8lV_TMb4UD6WtPEytMOejzySupgnfSIeNgPg-c"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function disconnectInstance() {
  console.log('🔄 Iniciando desconexão da instância do usuário viniciushtx@hotmail.com...')
  
  try {
    // Buscar dados do usuário primeiro
    const { data: userData, error: userError } = await supabase
      .from('kiwify')
      .select('*')
      .eq('email', 'viniciushtx@hotmail.com')
      .single()
      
    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError)
      return
    }
    
    console.log('👤 Dados do usuário encontrados:', userData)
    
    // Chamar a edge function de logout/delete
    const { data: result, error: functionError } = await supabase.functions.invoke('evolution-logout-delete', {
      body: {
        instanceName: userData["Nome da instancia da Evolution"] || 'testevini1350/0608',
        userId: userData.user_id,
        email: userData.email
      }
    })
    
    if (functionError) {
      console.error('❌ Erro na edge function:', functionError)
      return
    }
    
    console.log('✅ Resultado da desconexão:', result)
    console.log('🎉 Instância desconectada com sucesso! Usuário pode conectar nova instância.')
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

// Executar a desconexão
disconnectInstance()