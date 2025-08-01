import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Document type definition
export interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: string;
  titulo?: string | null;
  metadata?: Record<string, any> | null;
}

export const useDocuments = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Safe way to extract values from metadata
  const getMetadataValue = (metadata: any, key: string, defaultValue: string): string => {
    if (typeof metadata === 'object' && metadata !== null && key in metadata) {
      return String(metadata[key]) || defaultValue;
    }
    return defaultValue;
  };

  // Fetch documents from user's Supabase Storage bucket
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDocuments([]);
        return;
      }

      // Get user's bucket name (consistent with MediaUploadDialog)
      const bucketName = `user-${user.email?.replace(/[@.]/g, '-')}`;
      
      // List files from user's bucket recursively
      const allFiles: any[] = [];
      
      // First, get the user folder
      const { data: userFolder, error: folderError } = await supabase.storage
        .from(bucketName)
        .list(user.id, {
          limit: 100,
          offset: 0,
        });

      if (folderError) {
        console.error('Error fetching user folder:', folderError);
        toast({
          title: "Erro ao carregar arquivos",
          description: folderError.message,
          variant: "destructive",
        });
        return;
      }

      // For each subfolder, get the files
      if (userFolder && userFolder.length > 0) {
        for (const folder of userFolder) {
          if (folder.name) {
            const { data: subFiles, error: subError } = await supabase.storage
              .from(bucketName)
              .list(`${user.id}/${folder.name}`, {
                limit: 100,
                offset: 0,
              });

            if (!subError && subFiles) {
              // Add folder path to each file
              const filesWithPath = subFiles.map(file => ({
                ...file,
                fullPath: `${user.id}/${folder.name}/${file.name}`,
                folder: folder.name
              }));
              allFiles.push(...filesWithPath);
            }
          }
        }
      }

      // Transform storage files to Document interface
      const formattedDocs: Document[] = allFiles
        .filter(file => file.name && !file.name.startsWith('.') && file.name !== '.emptyFolderPlaceholder') // Filter out hidden files and folder placeholders
        .map((file, index) => {
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
          const fileSize = file.metadata?.size ? `${(file.metadata.size / 1024).toFixed(1)} KB` : 'Unknown';
          
          // Determine file type and category based on folder
          let type = 'unknown';
          let category = 'Documento';
          
          if (file.folder === 'documentos' || file.folder === 'tabela') {
            if (['pdf'].includes(fileExtension)) {
              type = 'pdf';
              category = 'PDF';
            } else if (['doc', 'docx'].includes(fileExtension)) {
              type = 'document';
              category = 'Documento';
            } else if (['txt'].includes(fileExtension)) {
              type = 'text';
              category = 'Texto';
            } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
              type = 'spreadsheet';
              category = 'Planilha';
            }
          } else if (file.folder === 'videos') {
            type = 'video';
            category = 'Vídeo';
          } else if (file.folder === 'audio') {
            type = 'audio';
            category = 'Áudio';
          }

          return {
            id: index + 1,
            name: file.name,
            type,
            size: fileSize,
            category,
            uploadedAt: file.created_at ? new Date(file.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
            titulo: file.name,
            metadata: file.metadata,
          };
        });
      
      setDocuments(formattedDocs);
    } catch (err) {
      console.error('Unexpected error fetching documents:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter documents to keep only unique titulo entries
  const filterUniqueByTitle = (docs: Document[]): Document[] => {
    const uniqueTitles = new Set<string>();
    return docs.filter(doc => {
      const title = doc.titulo || doc.name;
      if (uniqueTitles.has(title)) {
        return false;
      }
      uniqueTitles.add(title);
      return true;
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDocuments();
    toast({
      title: "Atualizando documentos",
      description: "Os documentos estão sendo atualizados do banco de dados.",
    });
  };

  // Delete document - Updated to call the webhook with the title
  const handleDeleteDocument = async (id: number, title: string) => {
    try {
      // Call webhook to delete file from RAG system
      console.log('Enviando solicitação para excluir arquivo:', title);
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/excluir-arquivo-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          titulo: title 
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir o arquivo: ${response.statusText}`);
      }

      // Only remove from UI if webhook call was successful
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error deleting document:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir o documento.",
        variant: "destructive",
      });
    }
  };

  // New function to clear all documents
  const clearAllDocuments = async () => {
    try {
      console.log('Enviando solicitação para excluir toda a base de conhecimento');
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/excluir-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Erro ao limpar a base de conhecimento: ${response.statusText}`);
      }

      // Clear the documents array
      setDocuments([]);
      
      toast({
        title: "Base de conhecimento limpa",
        description: "Todos os documentos foram removidos com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error clearing knowledge base:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível limpar a base de conhecimento.",
        variant: "destructive",
      });
    }
  };

  // Upload file to webhook
  const uploadFileToWebhook = async (file: File, category: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      console.log('Enviando arquivo para o webhook:', file.name, 'categoria:', category);
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/envia_rag', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar o arquivo: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Arquivo enviado com sucesso:', result);
      
      // After successful upload, refresh the document list
      await fetchDocuments();
      
      toast({
        title: "Documento adicionado",
        description: `${file.name} foi adicionado com sucesso!`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      
      toast({
        title: "Erro ao enviar documento",
        description: "Não foi possível enviar o documento para o sistema de conhecimento.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Load documents on hook initialization
  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    isLoading,
    isRefreshing,
    fetchDocuments,
    handleRefresh,
    handleDeleteDocument,
    uploadFileToWebhook,
    clearAllDocuments
  };
};
