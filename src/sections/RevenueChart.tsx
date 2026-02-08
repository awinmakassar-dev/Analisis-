import { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface RevenueChartProps {
  data: DashboardData;
  period: string;
}

export default function RevenueChart({ data, period }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const dailyData = data['Proyeksi 30 Hari'];
    
    return dailyData.map(d => ({
      date: new Date(d.Tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      revenue: d.Revenue_Rp / 1000000,
      profit: d.Net_Profit_Rp / 1000000,
      cogs: d.COGS_Rp / 1000000,
      operational: d.Operational_Cost_Rp / 1000000,
      cups: d.Actual_Cup_Total,
      achievement: d.Achievement_Rate_persen,
      isWeekend: d.Is_Weekend,
    }));
  }, [data]);

  const stats = useMemo(() => {
    const dailyData = data['Proyeksi 30 Hari'];
    const totalRevenue = dailyData.reduce((sum, d) => sum + d.Revenue_Rp, 0);
    const totalProfit = dailyData.reduce((sum, d) => sum + d.Net_Profit_Rp, 0);
    const avgDaily = totalRevenue / dailyData.length;
    
    return {
      totalRevenue,
      totalProfit,
      avgDaily,
      profitMargin: (totalProfit / totalRevenue) * 100,
    };
  }, [data]);

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
                {entry.name === 'Achievement %' 
                  ? `${entry.value.toFixed(1)}%`
                  : `Rp ${entry.value.toFixed(1)}M`
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
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm h-full">
      <CardHeader className="pb-3 space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Tren Revenue & Profit
            </CardTitle>
            <CardDescription className="text-sm">Performa keuangan {period === '7days' ? '7 hari' : '30 hari'}</CardDescription>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-lg font-bold text-orange-600">
                Rp{(stats.totalRevenue / 1000000).toFixed(0)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Profit</p>
              <p className="text-lg font-bold text-green-600">
                Rp{(stats.totalProfit / 1000000).toFixed(0)}M
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={11}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                stroke="#9ca3af"
                fontSize={11}
                tickFormatter={(value) => `Rp${value}`}
                width={50}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                fontSize={11}
                tickFormatter={(value) => `${value}%`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="Revenue"
                stroke="#f97316" 
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="profit" 
                name="Net Profit"
                stroke="#22c55e" 
                strokeWidth={2}
                fill="url(#profitGradient)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="achievement" 
                name="Achievement %"
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Mini Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Avg/Hari</p>
            <p className="text-sm font-semibold text-gray-900">
              Rp{(stats.avgDaily / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Margin</p>
            <p className="text-sm font-semibold text-green-600">
              {stats.profitMargin.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">COGS</p>
            <p className="text-sm font-semibold text-orange-600">
              {((stats.totalRevenue - stats.totalProfit) / stats.totalRevenue * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Growth</p>
            <p className="text-sm font-semibold text-blue-600">+15.3%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
