import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Line, ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Calendar } from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface PerformanceChartProps {
  data: DashboardData;
  period: string;
}

export default function PerformanceChart({ data, period }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const shiftData = data['Operasional per Shift'];
    
    const grouped = shiftData.reduce((acc: any, curr) => {
      if (!acc[curr.Hari]) {
        acc[curr.Hari] = {
          hari: curr.Hari,
          pagi: 0,
          siang: 0,
          sore: 0,
          total: 0,
          revenue: 0,
        };
      }
      
      const cups = curr.Total_Cup_Shift;
      const revenue = curr.Revenue_Shift_Rp;
      
      if (curr.Shift.includes('Pagi')) {
        acc[curr.Hari].pagi += cups;
      } else if (curr.Shift.includes('Siang')) {
        acc[curr.Hari].siang += cups;
      } else if (curr.Shift.includes('Sore')) {
        acc[curr.Hari].sore += cups;
      }
      
      acc[curr.Hari].total += cups;
      acc[curr.Hari].revenue += revenue;
      
      return acc;
    }, {});
    
    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return dayOrder.map(day => grouped[day] || { 
      hari: day, pagi: 0, siang: 0, sore: 0, total: 0, revenue: 0 
    });
  }, [data]);

  const dailyData = useMemo(() => {
    const daily = data['Proyeksi 30 Hari'];
    
    const grouped = daily.reduce((acc: any, curr) => {
      const dayName = curr.Hari;
      if (!acc[dayName]) {
        acc[dayName] = { count: 0, total: 0, achievement: 0 };
      }
      acc[dayName].count++;
      acc[dayName].total += curr.Actual_Cup_Total;
      acc[dayName].achievement += curr.Achievement_Rate_persen;
      return acc;
    }, {});
    
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayNames: Record<string, string> = {
      'Monday': 'Senin',
      'Tuesday': 'Selasa',
      'Wednesday': 'Rabu',
      'Thursday': 'Kamis',
      'Friday': 'Jumat',
      'Saturday': 'Sabtu',
      'Sunday': 'Minggu'
    };
    
    return dayOrder.map(day => ({
      hari: dayNames[day],
      avgCups: grouped[day] ? Math.round(grouped[day].total / grouped[day].count) : 0,
      avgAchievement: grouped[day] ? grouped[day].achievement / grouped[day].count : 0,
    }));
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
                {entry.name.includes('Achievement') 
                  ? `${entry.value.toFixed(1)}%`
                  : entry.value.toLocaleString('id-ID')
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Shift Performance */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-orange-500" />
            Performa per Shift
          </CardTitle>
          <CardDescription className="text-sm">Penjualan cup berdasarkan shift operasional</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hari" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(value) => `${value / 1000}K`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="pagi" name="Pagi" stackId="a" fill="#f97316" />
                <Bar dataKey="siang" name="Siang" stackId="a" fill="#fbbf24" />
                <Bar dataKey="sore" name="Sore" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Achievement */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5 text-orange-500" />
            Achievement Rate
          </CardTitle>
          <CardDescription className="text-sm">Rata-rata pencapaian target per hari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hari" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(value) => `${value / 1000}K`}
                  width={40}
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
                <Bar 
                  yAxisId="left"
                  dataKey="avgCups" 
                  name="Avg Cup"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgAchievement" 
                  name="Achievement %"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
