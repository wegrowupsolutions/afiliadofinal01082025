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

  // Delete document from Supabase Storage
  const handleDeleteDocument = async (id: number, title: string) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      // Find the document to get its full path
      const document = documents.find(doc => doc.id === id);
      if (!document) {
        toast({
          title: "Erro",
          description: "Documento não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Get user's bucket name
      const bucketName = `user-${user.email?.replace(/[@.]/g, '-')}`;
      
      // Find the file in storage to get its exact path
      const allFiles: any[] = [];
      
      // Get the user folder
      const { data: userFolder, error: folderError } = await supabase.storage
        .from(bucketName)
        .list(user.id, {
          limit: 100,
          offset: 0,
        });

      if (!folderError && userFolder) {
        for (const folder of userFolder) {
          if (folder.name) {
            const { data: subFiles, error: subError } = await supabase.storage
              .from(bucketName)
              .list(`${user.id}/${folder.name}`, {
                limit: 100,
                offset: 0,
              });

            if (!subError && subFiles) {
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

      // Find the exact file to delete
      const fileToDelete = allFiles.find(file => file.name === title);
      if (!fileToDelete) {
        toast({
          title: "Erro",
          description: "Arquivo não encontrado no storage.",
          variant: "destructive",
        });
        return;
      }

      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([fileToDelete.fullPath]);

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError);
        toast({
          title: "Erro ao excluir arquivo",
          description: deleteError.message,
          variant: "destructive",
        });
        return;
      }

      // Remove from UI
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Documento excluído",
        description: "O arquivo foi removido com sucesso!",
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

  // Clear all documents from Supabase Storage
  const clearAllDocuments = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      console.log('Limpando todos os arquivos do usuário');
      
      // Get user's bucket name
      const bucketName = `user-${user.email?.replace(/[@.]/g, '-')}`;
      
      // Get all files from user's folder
      const allFiles: string[] = [];
      
      // Get the user folder
      const { data: userFolder, error: folderError } = await supabase.storage
        .from(bucketName)
        .list(user.id, {
          limit: 100,
          offset: 0,
        });

      if (!folderError && userFolder) {
        for (const folder of userFolder) {
          if (folder.name) {
            const { data: subFiles, error: subError } = await supabase.storage
              .from(bucketName)
              .list(`${user.id}/${folder.name}`, {
                limit: 100,
                offset: 0,
              });

            if (!subError && subFiles) {
              const filePaths = subFiles.map(file => `${user.id}/${folder.name}/${file.name}`);
              allFiles.push(...filePaths);
            }
          }
        }
      }

      // Delete all files
      if (allFiles.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove(allFiles);

        if (deleteError) {
          console.error('Error deleting files from storage:', deleteError);
          toast({
            title: "Erro ao limpar arquivos",
            description: deleteError.message,
            variant: "destructive",
          });
          return;
        }
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
