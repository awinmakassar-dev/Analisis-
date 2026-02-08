import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Users, Target, Navigation } from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface ZonePerformanceProps {
  data: DashboardData;
  selectedZone: string;
}

export default function ZonePerformance({ data, selectedZone }: ZonePerformanceProps) {
  const zoneData = useMemo(() => {
    const zoningData = data['Alokasi Driver Zoning'];
    
    const grouped = zoningData.reduce((acc: any, curr) => {
      const zoneName = curr.Zona_Operasional;
      if (!acc[zoneName]) {
        acc[zoneName] = {
          name: zoneName,
          drivers: 0,
          locations: 0,
          targetPerDriver: curr.Target_Cup_per_Driver_per_Hari,
          price: curr.Harga_Rata_rata_per_Cup,
          radius: curr.Radius_Operasional_km,
        };
      }
      acc[zoneName].drivers += curr.Jumlah_Driver;
      acc[zoneName].locations++;
      return acc;
    }, {});
    
    return Object.values(grouped) as any[];
  }, [data]);

  const shiftDistribution = useMemo(() => {
    const zoningData = data['Alokasi Driver Zoning'];
    
    const totals = zoningData.reduce((acc: any, curr) => {
      acc.pagi += curr.Shift_Pagi_07_12;
      acc.siang += curr.Shift_Siang_12_17;
      acc.sore += curr.Shift_Sore_17_21;
      return acc;
    }, { pagi: 0, siang: 0, sore: 0 });
    
    return [
      { name: 'Pagi', value: totals.pagi, color: '#f97316', label: '07-12' },
      { name: 'Siang', value: totals.siang, color: '#fbbf24', label: '12-17' },
      { name: 'Sore', value: totals.sore, color: '#8b5cf6', label: '17-21' },
    ];
  }, [data]);

  const filteredZoneData = useMemo(() => {
    if (selectedZone === 'all') return zoneData;
    return zoneData.filter(z => z.name.includes(selectedZone.replace('Zona ', 'Zona ')));
  }, [zoneData, selectedZone]);

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
                {entry.name === 'Harga' 
                  ? `Rp ${entry.value.toLocaleString('id-ID')}`
                  : entry.value
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#f97316', '#fbbf24', '#8b5cf6', '#22c55e', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Zone Overview */}
      <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-orange-500" />
            Performa per Zona
          </CardTitle>
          <CardDescription className="text-sm">Alokasi driver dan karakteristik zona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredZoneData} margin={{ top: 10, right: 15, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={10}
                  tickMargin={8}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9ca3af"
                  fontSize={11}
                  width={35}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(value) => `Rp${value/1000}K`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar 
                  yAxisId="left"
                  dataKey="drivers" 
                  name="Driver"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="locations" 
                  name="Lokasi"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="price" 
                  name="Harga"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Zone Details */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100">
            {filteredZoneData.map((zone, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 truncate">{zone.name.replace('Zona ', '')}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-base font-semibold">{zone.drivers}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs text-gray-600">{zone.radius}km radius</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shift Distribution */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-orange-500" />
            Distribusi Shift
          </CardTitle>
          <CardDescription className="text-sm">Alokasi driver per shift</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {shiftDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value} driver`, 
                    `${name} (${props.payload.label})`
                  ]}
                  contentStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-3">
            {shiftDistribution.map((shift, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: shift.color }}
                  />
                  <span className="text-sm">{shift.name}</span>
                  <span className="text-xs text-gray-400">({shift.label})</span>
                </div>
                <span className="text-sm font-semibold">{shift.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
