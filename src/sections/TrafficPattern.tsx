import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrafficCone, Clock, MapPin, AlertTriangle, 
  CheckCircle2, Car, Gauge
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface TrafficPatternProps {
  data: DashboardData;
}

export default function TrafficPattern({ data }: TrafficPatternProps) {
  const trafficData = useMemo(() => {
    return data['Traffic Pattern Real'].map(t => ({
      zone: t.Zona,
      time: t.Waktu,
      level: t.Traffic_Level,
      congestion: t.Congestion_Index,
      speed: t.Avg_Speed_kmh,
      delay: t.Estimated_Delay_menit,
      bestTime: t.Best_Time_Operations,
      description: t.Keterangan,
    }));
  }, [data]);

  // Group by zone
  const zoneTraffic = useMemo(() => {
    const grouped = trafficData.reduce((acc: any, curr) => {
      if (!acc[curr.zone]) {
        acc[curr.zone] = [];
      }
      acc[curr.zone].push(curr);
      return acc;
    }, {});
    return grouped;
  }, [trafficData]);

  const getCongestionColor = (index: number) => {
    if (index >= 9) return '#ef4444';
    if (index >= 7) return '#f97316';
    if (index >= 5) return '#fbbf24';
    if (index >= 3) return '#22c55e';
    return '#10b981';
  };

  const getCongestionLabel = (index: number) => {
    if (index >= 9) return 'Severe';
    if (index >= 7) return 'Heavy';
    if (index >= 5) return 'Mod';
    if (index >= 3) return 'Light';
    return 'Free';
  };

  const zones = Object.keys(zoneTraffic);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
      <CardHeader className="pb-3 space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrafficCone className="w-5 h-5 text-orange-500" />
          Pola Lalu Lintas
        </CardTitle>
        <CardDescription className="text-sm">Analisis kemacetan dan waktu operasional optimal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Traffic Heatmap - Compact Grid */}
        <div className="space-y-3">
          {zones.map((zone, zoneIdx) => (
            <div key={zone} className="animate-fade-in" style={{ animationDelay: `${zoneIdx * 50}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-900">{zone}</h4>
              </div>
              
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="flex gap-1">
                    {zoneTraffic[zone].map((t: any, idx: number) => (
                      <div
                        key={idx}
                        className={`w-16 p-1.5 rounded-md text-center ${
                          t.bestTime === 'Yes' ? 'ring-2 ring-green-400 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: `${getCongestionColor(t.congestion)}20` }}
                        title={`${t.time}: ${t.level}`}
                      >
                        <p className="text-xs text-gray-600 font-medium">{t.time}</p>
                        <div 
                          className="w-full h-6 rounded mt-1 flex items-center justify-center"
                          style={{ backgroundColor: getCongestionColor(t.congestion) }}
                        >
                          <span className="text-xs font-bold text-white">{t.congestion}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{t.speed} km/h</p>
                        {t.bestTime === 'Yes' && (
                          <div className="flex items-center justify-center mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend & Stats in One Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Legend */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Kategori Kemacetan:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { color: '#10b981', label: 'Free Flow', range: '0-2' },
                { color: '#22c55e', label: 'Light', range: '3-4' },
                { color: '#fbbf24', label: 'Moderate', range: '5-6' },
                { color: '#f97316', label: 'Heavy', range: '7-8' },
                { color: '#ef4444', label: 'Severe', range: '9-10' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 bg-red-50 rounded-lg text-center border border-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-600">
                {trafficData.filter(t => t.level.includes('Severe')).length}
              </p>
              <p className="text-[10px] text-gray-500">Severe</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-center border border-orange-100">
              <Car className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-orange-600">
                {trafficData.filter(t => t.level.includes('Heavy')).length}
              </p>
              <p className="text-[10px] text-gray-500">Heavy</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-center border border-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-600">
                {trafficData.filter(t => t.bestTime === 'Yes').length}
              </p>
              <p className="text-[10px] text-gray-500">Optimal</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-center border border-blue-100">
              <Gauge className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-600">
                {Math.round(trafficData.reduce((sum, t) => sum + t.speed, 0) / trafficData.length)}
              </p>
              <p className="text-[10px] text-gray-500">km/h</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Rekomendasi Waktu Operasional</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Hindari rush hour: 06:00-09:00 & 17:00-20:00 di CBD & Transport Hub</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Optimal time: 09:00-15:00 untuk semua zona</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Area Kampus: Peak demand 08:00-10:00 & 12:00-14:00</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Mall Area: Peak demand 12:00-14:00 & 17:00-19:00</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
