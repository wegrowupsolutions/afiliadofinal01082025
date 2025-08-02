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
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
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
            {/* Mapa do Brasil usando SVG com estados clicáveis */}
            <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-hidden">
              <svg 
                viewBox="0 0 800 600" 
                className="w-full h-full"
                onMouseMove={handleMouseMove}
              >
                {/* Estados do Brasil - Simplified paths */}
                {/* Acre */}
                <path 
                  d="M50 350 L120 340 L130 380 L60 390 Z" 
                  fill={getStateColor('AC')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('AC', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Amazonas */}
                <path 
                  d="M50 250 L180 240 L200 320 L120 340 L50 350 Z" 
                  fill={getStateColor('AM')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('AM', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Roraima */}
                <path 
                  d="M120 180 L180 170 L190 220 L130 230 Z" 
                  fill={getStateColor('RR')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('RR', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Pará */}
                <path 
                  d="M180 170 L320 160 L340 250 L200 260 L180 240 Z" 
                  fill={getStateColor('PA')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('PA', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Amapá */}
                <path 
                  d="M320 140 L360 135 L370 170 L330 175 L320 160 Z" 
                  fill={getStateColor('AP')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('AP', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Maranhão */}
                <path 
                  d="M320 200 L400 190 L420 240 L340 250 Z" 
                  fill={getStateColor('MA')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('MA', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Piauí */}
                <path 
                  d="M400 220 L450 210 L470 260 L420 270 Z" 
                  fill={getStateColor('PI')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('PI', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Ceará */}
                <path 
                  d="M450 200 L520 190 L540 230 L470 240 Z" 
                  fill={getStateColor('CE')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('CE', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Rio Grande do Norte */}
                <path 
                  d="M520 210 L570 205 L580 235 L530 240 Z" 
                  fill={getStateColor('RN')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('RN', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Paraíba */}
                <path 
                  d="M520 240 L570 235 L580 265 L530 270 Z" 
                  fill={getStateColor('PB')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('PB', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Pernambuco */}
                <path 
                  d="M470 270 L550 260 L570 300 L490 310 Z" 
                  fill={getStateColor('PE')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('PE', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Alagoas */}
                <path 
                  d="M550 300 L580 295 L590 320 L560 325 Z" 
                  fill={getStateColor('AL')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('AL', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Sergipe */}
                <path 
                  d="M530 320 L560 315 L570 340 L540 345 Z" 
                  fill={getStateColor('SE')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('SE', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Bahia */}
                <path 
                  d="M400 310 L530 300 L540 380 L410 390 Z" 
                  fill={getStateColor('BA')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('BA', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Tocantins */}
                <path 
                  d="M340 280 L420 270 L440 330 L360 340 Z" 
                  fill={getStateColor('TO')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('TO', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Goiás */}
                <path 
                  d="M320 350 L420 340 L440 400 L340 410 Z" 
                  fill={getStateColor('GO')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('GO', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Distrito Federal */}
                <path 
                  d="M380 380 L390 375 L395 385 L385 390 Z" 
                  fill={getStateColor('DF')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('DF', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Mato Grosso */}
                <path 
                  d="M200 320 L320 310 L340 390 L220 400 Z" 
                  fill={getStateColor('MT')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('MT', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Mato Grosso do Sul */}
                <path 
                  d="M220 400 L340 390 L360 450 L240 460 Z" 
                  fill={getStateColor('MS')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('MS', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Minas Gerais */}
                <path 
                  d="M440 400 L540 390 L560 450 L460 460 Z" 
                  fill={getStateColor('MG')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('MG', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Espírito Santo */}
                <path 
                  d="M560 420 L580 415 L590 440 L570 445 Z" 
                  fill={getStateColor('ES')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('ES', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Rio de Janeiro */}
                <path 
                  d="M540 450 L590 445 L600 470 L550 475 Z" 
                  fill={getStateColor('RJ')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('RJ', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* São Paulo */}
                <path 
                  d="M460 460 L540 450 L550 490 L470 500 Z" 
                  fill={getStateColor('SP')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('SP', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Paraná */}
                <path 
                  d="M360 480 L470 470 L480 510 L370 520 Z" 
                  fill={getStateColor('PR')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('PR', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Santa Catarina */}
                <path 
                  d="M370 520 L480 510 L490 540 L380 550 Z" 
                  fill={getStateColor('SC')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('SC', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Rio Grande do Sul */}
                <path 
                  d="M300 530 L420 520 L430 570 L310 580 Z" 
                  fill={getStateColor('RS')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('RS', e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Rondônia */}
                <path 
                  d="M130 360 L200 350 L220 390 L150 400 Z" 
                  fill={getStateColor('RO')}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => handleMouseEnter('RO', e)}
                  onMouseLeave={handleMouseLeave}
                />
              </svg>
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