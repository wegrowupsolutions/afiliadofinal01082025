import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface BrazilMapChartProps {
  leadsByState: Record<string, number>;
  loading?: boolean;
}

const BrazilMapChart: React.FC<BrazilMapChartProps> = ({ leadsByState, loading = false }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Função para determinar a cor baseada na quantidade de leads
  const getStateColor = (state: string) => {
    const count = leadsByState[state] || 0;
    if (count === 0) return '#e5e7eb'; // Cinza claro
    if (count <= 5) return '#dbeafe'; // Azul muito claro
    if (count <= 10) return '#93c5fd'; // Azul claro
    if (count <= 20) return '#3b82f6'; // Azul médio
    return '#1d4ed8'; // Azul escuro
  };

  const handleMouseEnter = (state: string, event: React.MouseEvent) => {
    setHoveredState(state);
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.top 
    });
  };

  const handleMouseMove = (state: string, event: React.MouseEvent) => {
    if (hoveredState === state) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMousePosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.top 
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  const maxLeads = Math.max(...Object.values(leadsByState));
  const stateNames = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
    'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
    'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
    'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
    'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
    'SE': 'Sergipe', 'TO': 'Tocantins'
  };

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
            {/* Mapa do Brasil usando a imagem fornecida como base */}
            <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-hidden">
              {/* Imagem de fundo do mapa */}
              <img 
                src="/lovable-uploads/374c4eb3-1cf3-483e-be5b-3f9a6e48dcb0.png" 
                alt="Mapa do Brasil" 
                className="w-full h-full object-contain"
              />
              
              {/* Overlay invisível com áreas clicáveis dos estados */}
              <div className="absolute inset-0">
                {/* Região Norte */}
                <div 
                  className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-20 transition-colors"
                  style={{ top: '15%', left: '8%', width: '12%', height: '15%' }}
                  onMouseEnter={(e) => handleMouseEnter('AC', e)}
                  onMouseMove={(e) => handleMouseMove('AC', e)}
                  onMouseLeave={handleMouseLeave}
                  title="Acre"
                />
                <div 
                  className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-20 transition-colors"
                  style={{ top: '20%', left: '15%', width: '20%', height: '20%' }}
                  onMouseEnter={(e) => handleMouseEnter('AM', e)}
                  onMouseMove={(e) => handleMouseMove('AM', e)}
                  onMouseLeave={handleMouseLeave}
                  title="Amazonas"
                />
                {/* Estados restantes da Região Norte */}
                {['RR', 'PA', 'AP', 'RO'].map(state => {
                  const coords = {
                    'RR': { top: '5%', left: '20%', width: '8%', height: '10%' },
                    'PA': { top: '8%', left: '28%', width: '18%', height: '18%' },
                    'AP': { top: '2%', left: '45%', width: '6%', height: '8%' },
                    'RO': { top: '18%', left: '20%', width: '10%', height: '12%' }
                  };
                  return (
                    <div 
                      key={state}
                      className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-20 transition-colors"
                      style={coords[state]}
                      onMouseEnter={(e) => handleMouseEnter(state, e)}
                      onMouseMove={(e) => handleMouseMove(state, e)}
                      onMouseLeave={handleMouseLeave}
                      title={stateNames[state]}
                    />
                  );
                })}
                
                {/* Região Nordeste */}
                {['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'].map(state => {
                  const coords = {
                    'MA': { top: '15%', left: '45%', width: '12%', height: '10%' },
                    'PI': { top: '22%', left: '52%', width: '8%', height: '12%' },
                    'CE': { top: '12%', left: '58%', width: '12%', height: '10%' },
                    'RN': { top: '18%', left: '70%', width: '8%', height: '6%' },
                    'PB': { top: '22%', left: '72%', width: '6%', height: '6%' },
                    'PE': { top: '25%', left: '65%', width: '12%', height: '10%' },
                    'AL': { top: '32%', left: '74%', width: '6%', height: '6%' },
                    'SE': { top: '35%', left: '72%', width: '6%', height: '6%' },
                    'BA': { top: '30%', left: '55%', width: '15%', height: '18%' }
                  };
                  return (
                    <div 
                      key={state}
                      className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-20 transition-colors"
                      style={coords[state]}
                      onMouseEnter={(e) => handleMouseEnter(state, e)}
                      onMouseMove={(e) => handleMouseMove(state, e)}
                      onMouseLeave={handleMouseLeave}
                      title={stateNames[state]}
                    />
                  );
                })}
                
                {/* Região Centro-Oeste */}
                {['TO', 'MT', 'MS', 'GO', 'DF'].map(state => {
                  const coords = {
                    'TO': { top: '25%', left: '45%', width: '10%', height: '12%' },
                    'MT': { top: '30%', left: '35%', width: '15%', height: '20%' },
                    'MS': { top: '48%', left: '38%', width: '12%', height: '15%' },
                    'GO': { top: '42%', left: '48%', width: '12%', height: '15%' },
                    'DF': { top: '50%', left: '52%', width: '3%', height: '3%' }
                  };
                  return (
                    <div 
                      key={state}
                      className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-20 transition-colors"
                      style={coords[state]}
                      onMouseEnter={(e) => handleMouseEnter(state, e)}
                      onMouseMove={(e) => handleMouseMove(state, e)}
                      onMouseLeave={handleMouseLeave}
                      title={stateNames[state]}
                    />
                  );
                })}
                
                {/* Região Sudeste */}
                {['MG', 'ES', 'RJ', 'SP'].map(state => {
                  const coords = {
                    'MG': { top: '48%', left: '58%', width: '15%', height: '18%' },
                    'ES': { top: '55%', left: '72%', width: '6%', height: '8%' },
                    'RJ': { top: '62%', left: '70%', width: '8%', height: '8%' },
                    'SP': { top: '60%', left: '58%', width: '12%', height: '12%' }
                  };
                  return (
                    <div 
                      key={state}
                      className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-20 transition-colors"
                      style={coords[state]}
                      onMouseEnter={(e) => handleMouseEnter(state, e)}
                      onMouseMove={(e) => handleMouseMove(state, e)}
                      onMouseLeave={handleMouseLeave}
                      title={stateNames[state]}
                    />
                  );
                })}
                
                {/* Região Sul */}
                {['PR', 'SC', 'RS'].map(state => {
                  const coords = {
                    'PR': { top: '68%', left: '50%', width: '12%', height: '10%' },
                    'SC': { top: '75%', left: '52%', width: '10%', height: '8%' },
                    'RS': { top: '80%', left: '45%', width: '12%', height: '15%' }
                  };
                  return (
                    <div 
                      key={state}
                      className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-20 transition-colors"
                      style={coords[state]}
                      onMouseEnter={(e) => handleMouseEnter(state, e)}
                      onMouseMove={(e) => handleMouseMove(state, e)}
                      onMouseLeave={handleMouseLeave}
                      title={stateNames[state]}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Tooltip */}
            {hoveredState && (
              <div 
                className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 pointer-events-none"
                style={{
                  left: mousePosition.x + 10,
                  top: mousePosition.y - 50,
                  transform: 'translateY(-100%)'
                }}
              >
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {stateNames[hoveredState]} ({hoveredState})
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {leadsByState[hoveredState] || 0} leads
                </div>
              </div>
            )}
            
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