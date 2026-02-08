import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Users, Footprints, Coffee, 
  Navigation, AlertTriangle, Clock, Car,
  TrendingUp, Target, ArrowRight
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface ZonaOverviewProps {
  data: DashboardData;
}

export default function ZonaOverview({ data }: ZonaOverviewProps) {
  const zonaData = data['Zona Radius Data'];
  const distanceMatrix = data['Zona Distance Matrix'];

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalPopulasi: zonaData.reduce((sum, z) => sum + z.Populasi_Total, 0),
      totalFootfall: zonaData.reduce((sum, z) => sum + z.Footfall_Harian, 0),
      totalDemand: zonaData.reduce((sum, z) => sum + z.Demand_Power, 0),
      avgRadius: zonaData.reduce((sum, z) => sum + z.Radius_KM, 0) / zonaData.length,
    };
  }, [zonaData]);

  const getRiskLevelColor = (level: string) => {
    if (level === 'Tinggi') return 'bg-red-500';
    if (level === 'Sedang') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-500">Total Populasi</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {(totals.totalPopulasi / 1000).toFixed(0)}K
            </p>
            <p className="text-[10px] text-gray-400">5 zona Kembangan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Footprints className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-500">Total Footfall</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {(totals.totalFootfall / 1000).toFixed(0)}K
            </p>
            <p className="text-[10px] text-gray-400">per hari</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500">Demand Power</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {totals.totalDemand.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-gray-400">cups/day</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-amber-600" />
              <p className="text-xs text-gray-500">Avg Radius</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {totals.avgRadius.toFixed(1)}
            </p>
            <p className="text-[10px] text-gray-400">km per zona</p>
          </CardContent>
        </Card>
      </div>

      {/* Zona Cards */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-orange-500" />
            Data per Zona Area Kembangan
          </CardTitle>
          <CardDescription className="text-sm">
            Populasi, footfall, dan demand power untuk setiap zona operasional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {zonaData.map((zona, idx) => (
              <div 
                key={idx}
                className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-sm">{zona.Nama_Zona}</h4>
                  <Badge className="bg-orange-500 text-white text-[10px]">
                    {zona.Zona_ID.replace('ZONA_', 'Z')}
                  </Badge>
                </div>
                
                {/* HUB Location */}
                <p className="text-xs text-gray-500 mb-3 truncate" title={zona.Lokasi_HUB}>
                  📍 {zona.Lokasi_HUB}
                </p>
                
                {/* Key Metrics */}
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Populasi</span>
                      <span className="text-sm font-bold text-blue-600">
                        {(zona.Populasi_Total / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <Progress 
                      value={(zona.Populasi_Total / 100000) * 100} 
                      className="h-1 mt-1"
                    />
                  </div>
                  
                  <div className="p-2 bg-white rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Footfall</span>
                      <span className="text-sm font-bold text-purple-600">
                        {(zona.Footfall_Harian / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <Progress 
                      value={(zona.Footfall_Harian / 80000) * 100} 
                      className="h-1 mt-1"
                    />
                  </div>
                  
                  <div className="p-2 bg-white rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Demand</span>
                      <span className="text-sm font-bold text-green-600">
                        {zona.Demand_Power.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <Progress 
                      value={(zona.Demand_Power / 10000) * 100} 
                      className="h-1 mt-1"
                    />
                  </div>
                </div>
                
                {/* Radius Info */}
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-[10px] text-blue-600 mb-1">Radius Operasional</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{zona.Radius_KM} km</span>
                    <span className="text-[10px] text-gray-500">
                      {zona.Radius_Menit_Motor} min 🏍️
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distance Matrix */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="w-5 h-5 text-orange-500" />
            Jarak Antar Zona (Radius Coverage)
          </CardTitle>
          <CardDescription className="text-sm">
            Waktu tempuh antar zona dengan motor dan mobil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 font-medium text-gray-700 text-xs">Rute</th>
                  <th className="text-center py-2.5 px-3 font-medium text-gray-700 text-xs">Jarak</th>
                  <th className="text-center py-2.5 px-3 font-medium text-gray-700 text-xs">🏍️ Motor</th>
                  <th className="text-center py-2.5 px-3 font-medium text-gray-700 text-xs">🚗 Mobil</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-700 text-xs">Kondisi Jalan</th>
                </tr>
              </thead>
              <tbody>
                {distanceMatrix.map((route, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-orange-50/50">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {route.From.replace('ZONA_', 'Z')}
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {route.To.replace('ZONA_', 'Z')}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="font-medium">{route.Jarak_KM} km</span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="text-green-600 font-medium">{route.Waktu_Motor_Menit} min</span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="text-blue-600 font-medium">{route.Waktu_Mobil_Menit} min</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-gray-600">{route.Kondisi_Jalan}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Risiko Lalu Lintas per Zona
          </CardTitle>
          <CardDescription className="text-sm">
            Identifikasi risiko dan hambatan operasional di setiap zona
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zonaData.map((zona, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                    {zona.Zona_ID.replace('ZONA_', 'Z')}
                  </div>
                  <h4 className="font-bold text-gray-900">{zona.Nama_Zona}</h4>
                </div>
                
                <div className="space-y-2">
                  {zona.Risiko_Lalu_Lintas.map((risiko, ridx) => (
                    <div key={ridx} className="p-2 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getRiskLevelColor(risiko.Level)}`} />
                        <span className="text-xs font-medium text-gray-700">{risiko.Risiko}</span>
                        <Badge className={`text-[9px] h-4 px-1 ${getRiskLevelColor(risiko.Level)} text-white ml-auto`}>
                          {risiko.Level}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 ml-4">{risiko.Deskripsi}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Analysis */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-orange-600" />
            Analisis Coverage Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Zona Prioritas #1
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Puri Indah CBD (Zona A)</strong> memiliki demand power tertinggi dengan 8,500 cups/day dan footfall 75K/hari.
              </p>
              <p className="text-xs text-gray-500">
                Radius 2.5 km dapat dicakup dalam 8 menit dengan motor.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Waktu Respons Terbaik
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Zona A ↔ Zona E</strong> memiliki waktu tempuh tercepat (5 menit motor) dengan jarak hanya 1.5 km.
              </p>
              <p className="text-xs text-gray-500">
                Ideal untuk sharing resources antar HUB.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Car className="w-4 h-4 text-red-500" />
                Risiko Tertinggi
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Zona B (Transport Hub)</strong> memiliki risiko antrean kendaraan dan ojek online yang tinggi.
              </p>
              <p className="text-xs text-gray-500">
                Perlu koordinasi dengan pihak stasiun dan ojek online.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
