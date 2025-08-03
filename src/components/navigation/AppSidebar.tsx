import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Settings, 
  Calendar, 
  GraduationCap, 
  Home,
  Bot,
  Cog
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Métricas', url: '/metrics', icon: BarChart3 },
  { title: 'Chats', url: '/chats', icon: MessageSquare },
  { title: 'Base de Conhecimento', url: '/knowledge', icon: BookOpen },
  { title: 'Clientes', url: '/clients', icon: Users },
  { title: 'Evolution API', url: '/evolution', icon: Settings },
  { title: 'Agenda', url: '/schedule', icon: Calendar },
  { title: 'Academia', url: '/academia', icon: GraduationCap },
];

const adminItems = [
  { title: 'Config. Manager', url: '/configuration-manager', icon: Cog },
  { title: 'Config. Agente', url: '/agent-configuration', icon: Bot },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useIsAdmin();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Afiliado IA</h2>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="h-4 w-4 mr-2" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass}>
                        <item.icon className="h-4 w-4 mr-2" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}