
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MetricsDashboard from "./pages/MetricsDashboard";
import ChatsDashboard from "./pages/ChatsDashboard";
import KnowledgeManager from "./pages/KnowledgeManager";
import ClientsDashboard from "./pages/ClientsDashboard";
import Evolution from "./pages/Evolution";
import Schedule from "./pages/Schedule";
import Academia from "./pages/Academia";
import NotFound from "./pages/NotFound";
import ConfigurationManager from "./pages/ConfigurationManager";
import AgentConfiguration from "./pages/AgentConfiguration";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/metrics" element={<MetricsDashboard />} />
              <Route path="/chats" element={<ChatsDashboard />} />
              <Route path="/knowledge" element={<KnowledgeManager />} />
              <Route path="/clients" element={<ClientsDashboard />} />
              <Route path="/evolution" element={<Evolution />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/academia" element={<Academia />} />
              <Route path="/configuration" element={<ConfigurationManager />} />
              <Route path="/agent-configuration" element={<AgentConfiguration />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
