import { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudRain, Sun, AlertTriangle } from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface ClimateImpactProps {
  data: DashboardData;
}

export default function ClimateImpact({ data }: ClimateImpactProps) {
  const climateData = useMemo(() => {
    return data['Climate Data BMKG'].map(c => ({
      month: c.Bulan.substring(0, 3),
      rainfall: c.Curah_Hujan_mm,
      rainDays: c.Hari_Hujan,
      avgTemp: c.Suhu_Rata_Rata_C,
      minTemp: c.Suhu_Min_C,
      maxTemp: c.Suhu_Max_C,
      humidity: c.Kelembaban_persen,
      windSpeed: c.Kecepatan_Angin_m_s,
      season: c.Musim,
      impact: c.Impact_to_Operations,
    }));
  }, [data]);

  const getSeasonBadge = (season: string) => {
    if (season === 'Hujan') return <Badge className="bg-blue-500 text-white text-xs h-5 px-2">Hujan</Badge>;
    if (season === 'Kemarau') return <Badge className="bg-orange-500 text-white text-xs h-5 px-2">Kemarau</Badge>;
    return <Badge className="bg-yellow-500 text-white text-xs h-5 px-2">Peralihan</Badge>;
  };

  const getImpactBadge = (impact: string) => {
    if (impact.includes('Severe')) return <Badge className="bg-red-500 text-white text-xs h-5 px-2">Severe</Badge>;
    if (impact.includes('High')) return <Badge className="bg-orange-500 text-white text-xs h-5 px-2">High</Badge>;
    if (impact.includes('Moderate')) return <Badge className="bg-yellow-500 text-white text-xs h-5 px-2">Moderate</Badge>;
    return <Badge className="bg-green-500 text-white text-xs h-5 px-2">Low</Badge>;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
      <CardHeader className="pb-3 space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudRain className="w-5 h-5 text-orange-500" />
          Dampak Cuaca (BMKG)
        </CardTitle>
        <CardDescription className="text-sm">Analisis curah hujan dan dampak operasional</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={climateData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                tickFormatter={(value) => `${value}mm`}
                width={40}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                fontSize={11}
                tickFormatter={(value) => `${value}°C`}
                width={35}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = climateData.find(c => c.month === label);
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-orange-200 text-sm">
                        <p className="font-semibold text-gray-900 mb-2">{label}</p>
                        <div className="space-y-1">
                          <p className="text-blue-600">Hujan: {data?.rainfall}mm</p>
                          <p className="text-orange-600">Suhu: {data?.avgTemp}°C</p>
                          <p className="text-gray-600">Hari: {data?.rainDays}</p>
                          <p className="text-gray-600">Lembab: {data?.humidity}%</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2">
                          {getSeasonBadge(data?.season || '')}
                          {getImpactBadge(data?.impact || '')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="rainfall" 
                name="Hujan (mm)"
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#rainfallGradient)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgTemp" 
                name="Suhu (°C)"
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 4 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="rainDays" 
                name="Hari Hujan"
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Monthly Climate Cards */}
        <div className="grid grid-cols-6 gap-2 mt-4">
          {climateData.map((c, idx) => (
            <div 
              key={idx} 
              className={`p-2 rounded-lg text-center ${
                c.season === 'Hujan' ? 'bg-blue-50' :
                c.season === 'Kemarau' ? 'bg-orange-50' :
                'bg-yellow-50'
              }`}
            >
              <p className="text-xs text-gray-500">{c.month}</p>
              <div className="flex items-center justify-center my-1">
                {c.season === 'Hujan' ? (
                  <CloudRain className="w-4 h-4 text-blue-500" />
                ) : (
                  <Sun className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <p className="text-sm font-semibold">{c.rainfall}mm</p>
              <p className="text-xs text-gray-500">{c.rainDays} hari</p>
            </div>
          ))}
        </div>
        
        {/* Impact Summary */}
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Dampak Operasional</span>
          </div>
          <p className="text-sm text-amber-700 leading-relaxed">
            Musim hujan (Nov-Apr) berpotensi mengurangi mobilitas driver. 
            Puncak risiko Januari-Februari dengan 22.6 hari hujan dan curah hujan 290mm/bulan.
            Rekomendasi: Sediakan perlengkapan hujan dan partner dengan indoor locations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
