import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, TrendingUp, DollarSign, MapPin, 
  Clock, Briefcase, GraduationCap, Heart,
  Coffee, ShoppingBag, Target, ChevronRight,
  PieChart, BarChart3, UserCircle2, Wallet
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface CustomerAnalysisProps {
  data: DashboardData;
}

export default function CustomerAnalysis({ data }: CustomerAnalysisProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  
  const customerSegments = data['Customer Detailed Real'];
  const segmentSummary = data['Customer Segmentation'];

  // Calculate total metrics
  const totalMetrics = useMemo(() => {
    const totalPopulation = customerSegments.reduce((sum, s) => sum + s.Populasi_Target_Coffee_Drinkers, 0);
    const totalDemand = customerSegments.reduce((sum, s) => sum + s.Estimated_Daily_Coffee_Demand_Cups, 0);
    const avgIncome = customerSegments.reduce((sum, s) => sum + s.Income_Level_Rata_Rata_Rp, 0) / customerSegments.length;
    const totalLTV = segmentSummary.reduce((sum, s) => sum + s.Lifetime_Value_3bulan, 0);
    
    return { totalPopulation, totalDemand, avgIncome, totalLTV };
  }, [customerSegments, segmentSummary]);

  // Get selected segment details
  const selectedSegmentData = useMemo(() => {
    if (!selectedSegment) return null;
    return customerSegments.find(s => s.Nama_Segment_Utama === selectedSegment);
  }, [selectedSegment, customerSegments]);

  const getTrafficColor = (level: string) => {
    if (level === 'Very High') return 'bg-red-500';
    if (level === 'High') return 'bg-orange-500';
    if (level === 'Medium-High') return 'bg-yellow-500';
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
              <p className="text-xs text-gray-500">Target Market</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {(totalMetrics.totalPopulation / 1000).toFixed(1)}K
            </p>
            <p className="text-[10px] text-gray-400">Coffee drinkers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500">Daily Demand</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {totalMetrics.totalDemand.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-gray-400">cups/day</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-500">Avg Income</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              Rp{(totalMetrics.avgIncome / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-gray-400">per month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <p className="text-xs text-gray-500">Total LTV</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              Rp{(totalMetrics.totalLTV / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-gray-400">3 months</p>
          </CardContent>
        </Card>
      </div>

      {/* Segment Overview Cards */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle2 className="w-5 h-5 text-orange-500" />
            Profil Segment Pelanggan
          </CardTitle>
          <CardDescription className="text-sm">
            Klik segment untuk melihat detail lengkap karakteristik pelanggan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerSegments.map((segment, idx) => {
              const summary = segmentSummary.find(s => s.Nama_Segment === segment.Nama_Segment_Utama);
              const isSelected = selectedSegment === segment.Nama_Segment_Utama;
              
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedSegment(segment.Nama_Segment_Utama)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'bg-orange-50 border-orange-400 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-orange-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">{segment.Nama_Segment_Utama}</h4>
                    <Badge className={`text-[10px] ${getTrafficColor(segment.Traffic_Level)} text-white`}>
                      {segment.Traffic_Level}
                    </Badge>
                  </div>
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-[10px] text-gray-500">Populasi</p>
                      <p className="text-sm font-bold text-gray-900">
                        {(segment.Populasi_Target_Coffee_Drinkers / 1000).toFixed(1)}K
                      </p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-[10px] text-gray-500">Income</p>
                      <p className="text-sm font-bold text-green-600">
                        Rp{(segment.Income_Level_Rata_Rata_Rp / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{segment.Sub_Area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{segment.Peak_Hours.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coffee className="w-3 h-3 text-gray-400" />
                      <span>{segment.Estimated_Daily_Coffee_Demand_Cups} cup/hari</span>
                    </div>
                  </div>
                  
                  {/* LTV Badge */}
                  {summary && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
                      <p className="text-[10px] text-gray-500">Lifetime Value (3 bulan)</p>
                      <p className="text-sm font-bold text-orange-700">
                        Rp{summary.Lifetime_Value_3bulan.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Segment View */}
      {selectedSegmentData && (
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-orange-600" />
                  Detail Segment: {selectedSegmentData.Nama_Segment_Utama}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {selectedSegmentData.Sub_Area}
                </CardDescription>
              </div>
              <button 
                onClick={() => setSelectedSegment(null)}
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                Tutup
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Column 1: Demographics */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Demografi
                </h4>
                
                <div className="p-3 bg-white rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-500 mb-2">Target Populasi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedSegmentData.Populasi_Target_Coffee_Drinkers.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-400">orang</p>
                </div>
                
                <div className="p-3 bg-white rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-500 mb-2">Rata-rata Usia</p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedSegmentData.Usia_Rata_Rata} tahun
                  </p>
                </div>
                
                <div className="p-3 bg-white rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-500 mb-2">Income per Bulan</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp{selectedSegmentData.Income_Level_Rata_Rata_Rp.toLocaleString('id-ID')}
                  </p>
                </div>
                
                {selectedSegmentData.Gender_Distribution && (
                  <div className="p-3 bg-white rounded-xl border border-orange-200">
                    <p className="text-xs text-gray-500 mb-2">Distribusi Gender</p>
                    <div className="flex gap-2">
                      {Object.entries(selectedSegmentData.Gender_Distribution).map(([gender, pct]) => (
                        <div key={gender} className="flex-1 p-2 bg-gray-50 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500">{gender}</p>
                          <p className="text-sm font-bold">{pct}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2: Behavior */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                  Perilaku & Preferensi
                </h4>
                
                <div className="p-3 bg-white rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-500 mb-2">Peak Hours</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSegmentData.Peak_Hours.split(', ').map((hour, i) => (
                      <Badge key={i} className="bg-orange-100 text-orange-700 text-[10px]">
                        {hour}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-500 mb-2">Estimasi Demand Kopi</p>
                  <p className="text-xl font-bold text-amber-600">
                    {selectedSegmentData.Estimated_Daily_Coffee_Demand_Cups} cup/hari
                  </p>
                </div>
                
                {selectedSegmentData.Coffee_Preference && (
                  <div className="p-3 bg-white rounded-xl border border-orange-200">
                    <p className="text-xs text-gray-500 mb-2">Preferensi Kopi</p>
                    <div className="space-y-1.5">
                      {Object.entries(selectedSegmentData.Coffee_Preference).map(([type, pct]) => (
                        <div key={type} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 flex-1">{type}</span>
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedSegmentData.Spending_Habit && (
                  <div className="p-3 bg-white rounded-xl border border-orange-200">
                    <p className="text-xs text-gray-500 mb-1">Spending Habit</p>
                    <p className="text-sm text-gray-700">{selectedSegmentData.Spending_Habit}</p>
                  </div>
                )}
              </div>

              {/* Column 3: Additional Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-500" />
                  Detail Tambahan
                </h4>
                
                {selectedSegmentData.Education_Level && (
                  <div className="p-3 bg-white rounded-xl border border-orange-200">
                    <p className="text-xs text-gray-500 mb-2">Tingkat Pendidikan</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(selectedSegmentData.Education_Level).map(([edu, pct]) => (
                        <Badge key={edu} className="bg-purple-100 text-purple-700 text-[10px]">
                          {edu}: {pct}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedSegmentData.Job_Type && (
                  <div className="p-3 bg-white rounded-xl border border-orange-200">
                    <p className="text-xs text-gray-500 mb-2">Jenis Pekerjaan</p>
                    <div className="space-y-1">
                      {Object.entries(selectedSegmentData.Job_Type).map(([job, pct]) => (
                        <div key={job} className="flex justify-between text-xs">
                          <span className="text-gray-600">{job}</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedSegmentData.Loyalty_Potential && (
                  <div className="p-3 bg-white rounded-xl border border-orange-200">
                    <p className="text-xs text-gray-500 mb-1">Loyalty Potential</p>
                    <p className="text-sm text-gray-700">{selectedSegmentData.Loyalty_Potential}</p>
                  </div>
                )}
                
                <div className="p-3 bg-white rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-500 mb-1">Footfall Harian</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedSegmentData.Avg_Daily_Footfall.toLocaleString('id-ID')} orang
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">📍 Lokasi</p>
                  <p className="text-sm text-blue-800">{selectedSegmentData.Sub_Area}</p>
                  <p className="text-[10px] text-blue-500 mt-1">
                    Koordinat: {selectedSegmentData.Koordinat_Latitude.toFixed(4)}, {selectedSegmentData.Koordinat_Longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segment Comparison Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Perbandingan Segment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Segment</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Populasi</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Income/Bln</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">LTV (3bln)</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Avg Transaksi</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Frekuensi/Mg</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Channel</th>
                </tr>
              </thead>
              <tbody>
                {segmentSummary.map((seg, idx) => {
                  const detail = customerSegments.find(c => c.Nama_Segment_Utama === seg.Nama_Segment);
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-orange-50/50">
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium text-gray-900">{seg.Nama_Segment}</p>
                          <p className="text-[10px] text-gray-500">{detail?.Sub_Area}</p>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="font-medium">{(seg.Estimasi_Populasi / 1000).toFixed(1)}K</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="font-medium text-green-600">
                          Rp{(detail?.Income_Level_Rata_Rata_Rp || 0 / 1000000).toFixed(1)}M
                        </span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="font-medium text-orange-600">
                          Rp{(seg.Lifetime_Value_3bulan / 1000).toFixed(0)}K
                        </span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="font-medium">Rp{seg.Avg_Transaction_Value_Rp.toLocaleString('id-ID')}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="font-medium">{seg.Purchase_Frequency_per_Minggu}x</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-gray-600">{seg.Preferred_Channel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-5 h-5 text-orange-600" />
            Insight & Rekomendasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                Segment Prioritas
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">1.</span>
                  <span><strong>Office Workers</strong> - LTV tertinggi (Rp1.35M), konsisten beli setiap hari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">2.</span>
                  <span><strong>Healthcare Workers</strong> - Spending tinggi (Rp18K/transaksi), loyal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">3.</span>
                  <span><strong>Commuters</strong> - Rutinitas tinggi, captive market di stasiun</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-xl border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-green-500" />
                Strategi Marketing
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Fokus <strong>Mobile Order</strong> untuk Office & Healthcare workers</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Promo <strong>weekend</strong> untuk Mall Visitors & Residential</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-0.5" />
                  <span><strong>Student discount</strong> untuk University Students</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
