import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, MapPin, Clock, DollarSign, 
  Briefcase, GraduationCap, ShoppingBag, Home, Train
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface CustomerSegmentsProps {
  data: DashboardData;
}

export default function CustomerSegments({ data }: CustomerSegmentsProps) {
  const segmentData = useMemo(() => {
    return data['Customer Segmentation'].map(s => ({
      name: s.Nama_Segment,
      population: s.Estimasi_Populasi,
      avgTransaction: s.Avg_Transaction_Value_Rp,
      frequency: s.Purchase_Frequency_per_Minggu,
      preferredChannel: s.Preferred_Channel,
      peakDays: s.Peak_Days,
      ltv: s.Lifetime_Value_3bulan,
      karakteristik: s.Karakteristik_Utama,
      painPoints: s.Pain_Points,
    }));
  }, [data]);

  const detailedSegments = useMemo(() => {
    return data['Customer Detailed Real'].map(s => ({
      id: s.Segment_ID,
      mainSegment: s.Nama_Segment_Utama,
      subArea: s.Sub_Area,
      population: s.Populasi_Total,
      targetPopulation: s.Populasi_Target_Coffee_Drinkers,
      avgAge: s.Usia_Rata_Rata,
      avgIncome: s.Income_Level_Rata_Rata_Rp,
      peakHours: s.Peak_Hours,
      traffic: s.Traffic_Level,
      footfall: s.Avg_Daily_Footfall,
      coffeeDemand: s.Estimated_Daily_Coffee_Demand_Cups,
      genderDist: s.Gender_Distribution,
      coffeePref: s.Coffee_Preference,
    }));
  }, [data]);

  const radarData = useMemo(() => {
    return segmentData.map(s => ({
      subject: s.name.split(' ')[0],
      population: s.population / 1000,
      frequency: s.frequency * 5,
      spending: s.avgTransaction / 2000,
      ltv: s.ltv / 150000,
      fullMark: 100,
    }));
  }, [segmentData]);

  // Calculate market share based on population
  const totalPopulation = segmentData.reduce((sum, s) => sum + s.population, 0);
  const segmentWithShare = segmentData.map(s => ({
    ...s,
    marketShare: parseFloat(((s.population / totalPopulation) * 100).toFixed(1))
  }));

  const getSegmentIcon = (name: string) => {
    if (name.includes('Office')) return <Briefcase className="w-5 h-5" />;
    if (name.includes('University')) return <GraduationCap className="w-5 h-5" />;
    if (name.includes('Mall')) return <ShoppingBag className="w-5 h-5" />;
    if (name.includes('Residential')) return <Home className="w-5 h-5" />;
    if (name.includes('Commuters')) return <Train className="w-5 h-5" />;
    if (name.includes('Healthcare')) return <Users className="w-5 h-5" />;
    return <Users className="w-5 h-5" />;
  };

  const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-5">
      {/* Segment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Radar Chart */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-orange-500" />
              Segment Profile
            </CardTitle>
            <CardDescription className="text-sm">Karakteristik per segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Pop (K)"
                    dataKey="population"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Freq (x5)"
                    dataKey="frequency"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Market Share */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-5 h-5 text-orange-500" />
              Market Share
            </CardTitle>
            <CardDescription className="text-sm">Distribusi target market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentWithShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="marketShare"
                    nameKey="name"
                    label={({ name, marketShare }) => `${name.split(' ')[0]}: ${marketShare}%`}
                    labelLine={false}
                  >
                    {segmentWithShare.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-3">
              {segmentWithShare.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm truncate max-w-[120px]">{seg.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{seg.marketShare}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LTV Comparison */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-5 h-5 text-orange-500" />
              Lifetime Value
            </CardTitle>
            <CardDescription className="text-sm">LTV 3 bulan per segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentData} layout="vertical" margin={{ left: 55 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#9ca3af" 
                    fontSize={10}
                    tickFormatter={(value) => `Rp${value/1000}K`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#9ca3af" 
                    fontSize={9}
                    width={55}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'LTV 3 Bulan']}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="ltv" name="LTV" radius={[0, 4, 4, 0]}>
                    {segmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Details */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-orange-500" />
            Detail Segment
          </CardTitle>
          <CardDescription className="text-sm">Informasi lengkap per segment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {segmentData.map((seg, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                    {getSegmentIcon(seg.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{seg.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{seg.karakteristik.substring(0, 30)}...</p>
                  </div>
                </div>
                
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Populasi:</span>
                    <span className="font-medium text-xs">{seg.population.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Transaksi:</span>
                    <span className="font-medium text-xs">Rp{seg.avgTransaction.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Frekuensi:</span>
                    <span className="font-medium text-xs">{seg.frequency}x/minggu</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Channel:</span>
                    <span className="font-medium text-xs truncate max-w-[80px]">{seg.preferredChannel}</span>
                  </div>
                  <div className="pt-2 border-t border-orange-200/50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="truncate">{seg.peakDays}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">LTV:</span>
                      <span className="text-sm font-bold text-green-600">
                        Rp{seg.ltv.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sub-area Details */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-orange-500" />
            Sub-Area Analysis
          </CardTitle>
          <CardDescription className="text-sm">Detail per sub-area dengan preferensi kopi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 font-medium text-gray-700 text-xs">Segment</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-700 text-xs">Sub Area</th>
                  <th className="text-right py-2.5 px-3 font-medium text-gray-700 text-xs">Pop</th>
                  <th className="text-right py-2.5 px-3 font-medium text-gray-700 text-xs">Target</th>
                  <th className="text-right py-2.5 px-3 font-medium text-gray-700 text-xs">Usia</th>
                  <th className="text-right py-2.5 px-3 font-medium text-gray-700 text-xs">Income</th>
                  <th className="text-center py-2.5 px-3 font-medium text-gray-700 text-xs">Traffic</th>
                  <th className="text-right py-2.5 px-3 font-medium text-gray-700 text-xs">Demand</th>
                </tr>
              </thead>
              <tbody>
                {detailedSegments.map((area, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-orange-50/50">
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {area.mainSegment.split(' ')[0]}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 max-w-[180px] truncate text-xs" title={area.subArea}>
                      {area.subArea}
                    </td>
                    <td className="py-2 px-3 text-right text-xs">
                      {(area.population / 1000).toFixed(0)}K
                    </td>
                    <td className="py-2 px-3 text-right text-orange-600 font-medium text-xs">
                      {(area.targetPopulation / 1000).toFixed(0)}K
                    </td>
                    <td className="py-2 px-3 text-right text-xs">
                      {area.avgAge}th
                    </td>
                    <td className="py-2 px-3 text-right text-xs">
                      Rp{(area.avgIncome / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] h-4 px-1.5 ${
                          area.traffic.includes('Very') ? 'bg-red-50 text-red-700 border-red-200' :
                          area.traffic.includes('High') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        {area.traffic}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-xs">
                      {area.coffeeDemand.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
