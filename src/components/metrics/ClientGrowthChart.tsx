
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ClientGrowthChartProps {
  data: Array<{ month: string; clients: number }>;
  loading?: boolean;
}

const ClientGrowthChart: React.FC<ClientGrowthChartProps> = ({ data, loading = false }) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Crescimento de Clientes ({new Date().getFullYear()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-80">
            <ChartContainer
              config={{
                clients: {
                  label: 'Clientes',
                  theme: {
                    light: '#8B5CF6',
                    dark: '#A78BFA',
                  },
                },
              }}
            >
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-clients)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-clients)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          className="bg-white dark:bg-gray-950 shadow-md"
                          payload={payload}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clients"
                  stroke="var(--color-clients)"
                  strokeWidth={2}
                  fill="url(#clientsGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientGrowthChart;
