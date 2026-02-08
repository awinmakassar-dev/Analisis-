import { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface MonthlyProjectionProps {
  data: DashboardData;
}

export default function MonthlyProjection({ data }: MonthlyProjectionProps) {
  const monthlyData = useMemo(() => {
    return data['KPI Bulanan 12 Bulan'].map(m => ({
      month: m.Bulan.substring(0, 3),
      revenue: m.Revenue_Rp / 1000000000,
      profit: m.Net_Profit_Rp / 1000000000,
      cogs: m.COGS_Rp / 1000000000,
      operational: m.Operational_Cost_Rp / 1000000000,
      cups: m.Total_Cup_Bulan / 1000,
      avgCups: m.Avg_Cup_per_Hari,
      profitMargin: m.Profit_Margin_persen,
      accumulated: m.Accumulated_Profit_Rp / 1000000000,
      drivers: m.Driver_Count,
    }));
  }, [data]);

  const sensitivityData = useMemo(() => {
    return data['Sensitivity Analysis'].map(s => ({
      scenario: s.Scenario,
      revenue: s.Revenue_per_Month_Rp / 1000000000,
      profit: s.Net_Profit_Rp / 1000000000,
      margin: s.Profit_Margin_persen,
      roi: s.ROI_Month_persen,
      cups: s.Total_Cup_per_Month / 1000,
    }));
  }, [data]);

  const totalStats = useMemo(() => {
    const total = monthlyData.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      profit: acc.profit + curr.profit,
      cups: acc.cups + curr.cups,
    }), { revenue: 0, profit: 0, cups: 0 });
    
    const lastMonth = monthlyData[monthlyData.length - 1];
    
    return {
      totalRevenue: total.revenue,
      totalProfit: total.profit,
      totalCups: total.cups,
      finalAccumulated: lastMonth?.accumulated || 0,
      avgMargin: monthlyData.reduce((sum, m) => sum + m.profitMargin, 0) / monthlyData.length,
    };
  }, [monthlyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-orange-200 text-sm">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 py-0.5">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium">
                {entry.name.includes('Margin') 
                  ? `${entry.value.toFixed(1)}%`
                  : entry.name.includes('Cups')
                  ? `${entry.value.toFixed(0)}K`
                  : `Rp${entry.value.toFixed(2)}B`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* 12 Month Projection */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-orange-500" />
                Proyeksi 12 Bulan
              </CardTitle>
              <CardDescription className="text-sm">Revenue, profit, dan akumulasi</CardDescription>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-orange-600">
                  Rp{totalStats.totalRevenue.toFixed(1)}B
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Profit</p>
                <p className="text-lg font-bold text-green-600">
                  Rp{totalStats.totalProfit.toFixed(1)}B
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profitGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  fontSize={11}
                  tickMargin={8}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(value) => `Rp${value}`}
                  width={45}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(value) => `${value}%`}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="#f97316" 
                  strokeWidth={2}
                  fill="url(#revenueGradient2)"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="profit" 
                  name="Net Profit"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fill="url(#profitGradient2)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="profitMargin" 
                  name="Margin %"
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Monthly Stats */}
          <div className="grid grid-cols-6 gap-2 mt-4 pt-4 border-t border-gray-100">
            {monthlyData.map((m, idx) => (
              <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">{m.month}</p>
                <p className="text-sm font-semibold text-gray-900">{m.revenue.toFixed(1)}B</p>
                <p className="text-xs text-green-600">{m.profitMargin.toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity Analysis */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Sensitivity Analysis
          </CardTitle>
          <CardDescription className="text-sm">Skenario pessimistic, base case, optimistic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sensitivityData.map((scenario, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border ${
                  scenario.scenario === 'Base Case' 
                    ? 'bg-orange-50 border-orange-300' 
                    : scenario.scenario === 'Optimistic'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">{scenario.scenario}</h4>
                  {scenario.scenario === 'Base Case' ? (
                    <Badge className="bg-orange-500 text-white text-xs h-6 px-2">
                      <Minus className="w-3.5 h-3.5" />
                    </Badge>
                  ) : scenario.scenario === 'Optimistic' ? (
                    <Badge className="bg-green-500 text-white text-xs h-6 px-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 text-white text-xs h-6 px-2">
                      <TrendingDown className="w-3.5 h-3.5" />
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Revenue:</span>
                    <span className="font-medium">Rp{scenario.revenue.toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Net Profit:</span>
                    <span className={`font-medium ${
                      scenario.scenario === 'Optimistic' ? 'text-green-600' :
                      scenario.scenario === 'Pessimistic' ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      Rp{scenario.profit.toFixed(2)}B
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Margin:</span>
                    <span className="font-medium">{scenario.margin.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">ROI:</span>
                    <span className="font-medium">{scenario.roi.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Cups:</span>
                    <span className="font-medium">{scenario.cups.toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
