
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bot, LogOut, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import SearchBar from '@/components/knowledge/SearchBar';
import DocumentGrid from '@/components/knowledge/DocumentGrid';
import MediaUploadDialog from '@/components/knowledge/MediaUploadDialog';
import { useDocuments } from '@/hooks/useDocuments';

const KnowledgeManager = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  
  // Use the custom hook for document management
  const { 
    documents, 
    isLoading, 
    isRefreshing, 
    handleRefresh, 
    handleDeleteDocument,
    clearAllDocuments,
    fetchDocuments
  } = useDocuments();

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handle upload completion
  const handleUploadComplete = () => {
    fetchDocuments();
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowLeft 
              className="h-5 w-5 text-white cursor-pointer hover:bg-blue-700 dark:hover:bg-gray-700 p-1 rounded transition-colors" 
              onClick={handleBackToDashboard}
            />
            <Bot className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Afiliado IA</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              Bem-vindo, {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} className="border-white text-white bg-gray-950/50 hover:bg-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gerenciador de Conhecimento
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          {/* Search and Action Buttons */}
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            onAddDocument={() => setIsMediaUploadOpen(true)}
            onClearAll={clearAllDocuments}
            isRefreshing={isRefreshing}
          />

          {/* Document Grid */}
          <DocumentGrid 
            documents={documents}
            searchQuery={searchQuery}
            onDeleteDocument={handleDeleteDocument}
          />

          {/* Media Upload Dialog */}
          <MediaUploadDialog 
            isOpen={isMediaUploadOpen}
            onOpenChange={setIsMediaUploadOpen}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </main>
    </div>
  );
};

export default KnowledgeManager;
