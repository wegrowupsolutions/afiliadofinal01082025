import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="h-8 w-8" />
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-muted/50 hidden sm:inline-flex">
                {user?.user_metadata?.name || user?.email}
              </Badge>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="hidden sm:inline-flex"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={signOut}
                className="sm:hidden"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}