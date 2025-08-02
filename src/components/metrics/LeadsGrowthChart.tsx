import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface LeadsGrowthChartProps {
  data: Array<{ month: string; leads: number }>;
  loading?: boolean;
}

const LeadsGrowthChart: React.FC<LeadsGrowthChartProps> = ({ data, loading = false }) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Crescimento de Leads ({new Date().getFullYear()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-80">
            <ChartContainer
              config={{
                leads: {
                  label: 'Leads',
                  theme: {
                    light: '#3B82F6',
                    dark: '#60A5FA',
                  },
                },
              }}
            >
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-leads)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0} />
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
                  dataKey="leads"
                  stroke="var(--color-leads)"
                  strokeWidth={2}
                  fill="url(#leadsGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsGrowthChart;