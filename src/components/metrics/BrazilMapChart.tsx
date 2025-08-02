import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface BrazilMapChartProps {
  leadsByState: Record<string, number>;
  loading?: boolean;
}

const BrazilMapChart: React.FC<BrazilMapChartProps> = ({ leadsByState, loading = false }) => {
  // Função para determinar a cor baseada na quantidade de leads
  const getStateColor = (state: string) => {
    const count = leadsByState[state] || 0;
    if (count === 0) return '#e5e7eb'; // Cinza claro
    if (count <= 5) return '#dbeafe'; // Azul muito claro
    if (count <= 10) return '#93c5fd'; // Azul claro
    if (count <= 20) return '#3b82f6'; // Azul médio
    return '#1d4ed8'; // Azul escuro
  };

  // Função para determinar a cor do texto baseada na cor de fundo
  const getTextColor = (state: string) => {
    const count = leadsByState[state] || 0;
    return count > 10 ? '#ffffff' : '#1f2937';
  };

  const maxLeads = Math.max(...Object.values(leadsByState));

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
          Leads por Estado
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mapa do Brasil usando SVG simples */}
            <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-hidden">
              <img 
                src="/lovable-uploads/59934b56-2483-4012-9266-6fd89d32489c.png" 
                alt="Mapa do Brasil" 
                className="w-full h-full object-contain opacity-20"
              />
              
              {/* Overlay com dados dos estados */}
              <div className="absolute inset-0 p-4">
                <div className="grid grid-cols-4 gap-2 h-full">
                  {/* Região Norte */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300">Norte</h4>
                    {['AM', 'RR', 'AP', 'PA', 'TO', 'RO', 'AC'].map(state => (
                      <div 
                        key={state}
                        className="text-xs p-1 rounded"
                        style={{ 
                          backgroundColor: getStateColor(state),
                          color: getTextColor(state)
                        }}
                      >
                        {state}: {leadsByState[state] || 0}
                      </div>
                    ))}
                  </div>
                  
                  {/* Região Nordeste */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nordeste</h4>
                    {['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'].map(state => (
                      <div 
                        key={state}
                        className="text-xs p-1 rounded"
                        style={{ 
                          backgroundColor: getStateColor(state),
                          color: getTextColor(state)
                        }}
                      >
                        {state}: {leadsByState[state] || 0}
                      </div>
                    ))}
                  </div>
                  
                  {/* Região Centro-Oeste */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300">Centro-Oeste</h4>
                    {['MT', 'MS', 'GO', 'DF'].map(state => (
                      <div 
                        key={state}
                        className="text-xs p-1 rounded"
                        style={{ 
                          backgroundColor: getStateColor(state),
                          color: getTextColor(state)
                        }}
                      >
                        {state}: {leadsByState[state] || 0}
                      </div>
                    ))}
                    
                    {/* Região Sudeste */}
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-4">Sudeste</h4>
                    {['MG', 'ES', 'RJ', 'SP'].map(state => (
                      <div 
                        key={state}
                        className="text-xs p-1 rounded"
                        style={{ 
                          backgroundColor: getStateColor(state),
                          color: getTextColor(state)
                        }}
                      >
                        {state}: {leadsByState[state] || 0}
                      </div>
                    ))}
                  </div>
                  
                  {/* Região Sul */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sul</h4>
                    {['PR', 'SC', 'RS'].map(state => (
                      <div 
                        key={state}
                        className="text-xs p-1 rounded"
                        style={{ 
                          backgroundColor: getStateColor(state),
                          color: getTextColor(state)
                        }}
                      >
                        {state}: {leadsByState[state] || 0}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legenda */}
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span>0 leads</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>1-5 leads</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>6-10 leads</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>11-20 leads</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-800 rounded"></div>
                <span>20+ leads</span>
              </div>
            </div>
            
            {maxLeads > 0 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                Estado com mais leads: <span className="font-semibold">
                  {Object.entries(leadsByState).find(([, count]) => count === maxLeads)?.[0]} ({maxLeads} leads)
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrazilMapChart;