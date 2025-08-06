import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ufcarzzouvxgqljqxdnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY2FyenpvdXZ4Z3FsanF4ZG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NzU5NTMsImV4cCI6MjA2OTE1MTk1M30.wurxO8lV_TMb4UD6WtPEytMOejzySupgnfSIeNgPg-c'
)

async function deleteEverything() {
  console.log('🗑️ Deletando instância testevini1350/0608...')
  
  try {
    // Chamar edge function para deletar da Evolution API
    const { data, error } = await supabase.functions.invoke('evolution-logout-delete', {
      body: { instanceName: 'testevini1350/0608' }
    })
    
    if (error) {
      console.error('❌ Erro na edge function:', error)
    } else {
      console.log('✅ Edge function resultado:', data)
    }
    
    // Limpar dados no Supabase também
    const { error: updateError } = await supabase
      .from('kiwify')
      .update({
        'Nome da instancia da Evolution': null,
        is_connected: false,
        connected_at: null,
        disconnected_at: new Date().toISOString(),
        evolution_instance_id: null,
        evolution_profile_name: null,
        evolution_profile_status: null,
        evolution_raw_data: null
      })
      .eq('email', 'viniciushtx@hotmail.com')
    
    if (updateError) {
      console.error('❌ Erro ao limpar Supabase:', updateError)
    } else {
      console.log('✅ Dados limpos no Supabase')
    }
    
    console.log('🎉 Instância completamente deletada!')
    
  } catch (err) {
    console.error('💥 Erro geral:', err)
  }
}

deleteEverything()