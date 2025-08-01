import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Video, 
  Music, 
  Table, 
  Upload, 
  Loader2, 
  X, 
  FileUp 
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

type MediaType = 'documentos' | 'videos' | 'audio' | 'tabela';

interface MediaTypeConfig {
  label: string;
  icon: React.ReactNode;
  acceptedTypes: string[];
  bucket: string;
  maxSize: number; // em MB
}

const MediaUploadDialog: React.FC<MediaUploadDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onUploadComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('documentos');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const getUserBucket = (userId: string) => `user-${userId.split('-')[0]}`;

  const mediaTypes: Record<MediaType, MediaTypeConfig> = {
    documentos: {
      label: 'Documentos',
      icon: <FileText className="h-5 w-5" />,
      acceptedTypes: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
      bucket: user ? getUserBucket(user.id) : 'documents',
      maxSize: 50
    },
    videos: {
      label: 'Vídeos',
      icon: <Video className="h-5 w-5" />,
      acceptedTypes: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      bucket: user ? getUserBucket(user.id) : 'videos',
      maxSize: 500
    },
    audio: {
      label: 'Áudio',
      icon: <Music className="h-5 w-5" />,
      acceptedTypes: ['.mp3', '.wav', '.ogg', '.m4a', '.aac'],
      bucket: user ? getUserBucket(user.id) : 'audio',
      maxSize: 100
    },
    tabela: {
      label: 'Tabela',
      icon: <Table className="h-5 w-5" />,
      acceptedTypes: ['.xls', '.xlsx', '.csv', '.ods'],
      bucket: user ? getUserBucket(user.id) : 'documents',
      maxSize: 25
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const config = mediaTypes[selectedMediaType];
      
      // Verificar tamanho do arquivo
      if (file.size > config.maxSize * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${config.maxSize}MB`,
          variant: "destructive",
        });
        return;
      }
      
      // Verificar tipo do arquivo
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!config.acceptedTypes.includes(fileExtension)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `Tipos aceitos: ${config.acceptedTypes.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const uploadToSupabase = async (file: File) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    const config = mediaTypes[selectedMediaType];
    const fileExtension = file.name.split('.').pop();
    const fileName = `${selectedMediaType}/${Date.now()}-${file.name}`;
    
    // Upload para o bucket apropriado
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(fileName, file);

    if (error) throw error;

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(fileName);

    // Salvar metadados na tabela apropriada
    let tableInsert;
    
    switch (selectedMediaType) {
      case 'documentos':
      case 'tabela':
        tableInsert = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            titulo: file.name,
            arquivo_url: urlData.publicUrl,
            tipo: selectedMediaType,
            tamanho_arquivo: file.size,
            tags: category ? [category] : []
          });
        break;
        
      case 'videos':
        tableInsert = await supabase
          .from('media_files')
          .insert({
            user_id: user.id,
            title: file.name,
            file_url: urlData.publicUrl,
            file_type: 'video',
            file_size: file.size,
            category: category || 'Vídeo',
            tags: category ? [category] : []
          });
        break;
        
      case 'audio':
        tableInsert = await supabase
          .from('audio_files')
          .insert({
            user_id: user.id,
            title: file.name,
            file_url: urlData.publicUrl,
            file_size: file.size,
            category: category || 'Áudio',
            tags: category ? [category] : []
          });
        break;
    }

    if (tableInsert?.error) throw tableInsert.error;

    return data;
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      await uploadToSupabase(selectedFile);
      
      toast({
        title: "Upload realizado com sucesso!",
        description: `${selectedFile.name} foi adicionado à sua biblioteca`,
      });
      
      // Reset form
      setSelectedFile(null);
      setCategory('');
      onUploadComplete();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do arquivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setCategory('');
    setSelectedMediaType('documentos');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Selecione um arquivo do seu computador para adicionar à base de conhecimento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Seletor de tipo de mídia */}
          <div>
            <label className="block text-sm font-medium mb-3">Tipo de Mídia</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(mediaTypes).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedMediaType === key ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setSelectedMediaType(key as MediaType)}
                >
                  {config.icon}
                  <span className="text-xs">{config.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Área de upload */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors hover:border-gray-400 dark:hover:border-gray-500"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={mediaTypes[selectedMediaType].acceptedTypes.join(',')}
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center">
              <FileUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                Clique para selecionar ou arraste o arquivo aqui
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {mediaTypes[selectedMediaType].acceptedTypes.join(', ').toUpperCase()}
              </p>
              <p className="text-xs text-gray-400">
                Tamanho máximo: {mediaTypes[selectedMediaType].maxSize}MB
              </p>
              
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar Arquivo
              </Button>
            </div>
          </div>

          {/* Arquivo selecionado */}
          {selectedFile && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                Arquivo selecionado
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                <span>{selectedFile.name}</span>
                <Badge variant="secondary">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* Campo de categoria */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Categoria
            </label>
            <Input
              id="category"
              placeholder="ex: Procedimentos, Financeiro, Saúde..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fazendo Upload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploadDialog;