import { useMemo } from 'react';
import { 
  Coffee, TrendingUp, DollarSign, Users, 
  Target, MapPin
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardData } from '@/types/data';

interface KPICardsProps {
  data: DashboardData;
  selectedZone?: string;
}

export default function KPICards({ data, selectedZone = 'all' }: KPICardsProps) {
  const kpiData = useMemo(() => {
    const dailyData = data['Proyeksi 30 Hari'];
    const monthlyData = data['KPI Bulanan 12 Bulan'];
    const summaryData = data['Master Summary'];
    const locations = data['Lokasi Strategis GPS'];
    
    // Calculate zone-specific multiplier based on footfall distribution
    let zoneMultiplier = 1;
    if (selectedZone !== 'all') {
      const zoneCategoryMap: Record<string, string[]> = {
        'Puri Indah CBD': ['Office Complex', 'Mall Area'],
        'Transport Hub': ['Transport Hub'],
        'Healthcare': ['Healthcare Facility'],
        'Market': ['Market Area'],
        'Residential': ['Residential Complex'],
      };
      const allowedCategories = zoneCategoryMap[selectedZone] || [];
      const zoneLocations = locations.filter(loc => allowedCategories.includes(loc.Kategori));
      const zoneFootfall = zoneLocations.reduce((sum, loc) => sum + loc.Estimasi_Footfall_per_Hari, 0);
      const totalFootfall = locations.reduce((sum, loc) => sum + loc.Estimasi_Footfall_per_Hari, 0);
      zoneMultiplier = totalFootfall > 0 ? zoneFootfall / totalFootfall : 1;
    }
    
    const totalRevenue = dailyData.reduce((sum, d) => sum + d.Revenue_Rp, 0) * zoneMultiplier;
    const totalProfit = dailyData.reduce((sum, d) => sum + d.Net_Profit_Rp, 0) * zoneMultiplier;
    const totalCups = dailyData.reduce((sum, d) => sum + d.Actual_Cup_Total, 0) * zoneMultiplier;
    const avgAchievement = dailyData.reduce((sum, d) => sum + d.Achievement_Rate_persen, 0) / dailyData.length;
    
    const latestMonth = monthlyData[monthlyData.length - 1];
    const totalPopulation = Number(summaryData.find(s => s.Metrik === 'Populasi Kembangan')?.Nilai) || 334361;
    const totalDrivers = selectedZone === 'all' ? 50 : Math.max(5, Math.round(50 * zoneMultiplier));
    
    return {
      totalRevenue,
      totalProfit,
      totalCups,
      avgAchievement,
      totalPopulation: selectedZone === 'all' ? totalPopulation : Math.round(totalPopulation * zoneMultiplier),
      totalDrivers,
      monthlyRevenue: (latestMonth?.Revenue_Rp || 0) * zoneMultiplier,
      monthlyProfit: (latestMonth?.Net_Profit_Rp || 0) * zoneMultiplier,
      profitMargin: latestMonth?.Profit_Margin_persen || 0,
      zoneMultiplier,
      selectedZone,
    };
  }, [data, selectedZone]);

  const getZoneLabel = (zone: string) => {
    if (zone === 'all') return '';
    return ` (${zone.split(' ')[0]})`;
  };

  const cards = [
    {
      title: `Revenue${getZoneLabel(kpiData.selectedZone)}`,
      value: `Rp${(kpiData.totalRevenue / 1000000).toFixed(1)}M`,
      subtitle: `Bulan: Rp${(kpiData.monthlyRevenue / 1000000000).toFixed(2)}B`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
    },
    {
      title: `Net Profit${getZoneLabel(kpiData.selectedZone)}`,
      value: `Rp${(kpiData.totalProfit / 1000000).toFixed(1)}M`,
      subtitle: `Margin: ${kpiData.profitMargin.toFixed(1)}%`,
      icon: TrendingUp,
      trend: '+8.3%',
      trendUp: true,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: `Cup Terjual${getZoneLabel(kpiData.selectedZone)}`,
      value: `${(kpiData.totalCups / 1000).toFixed(1)}K`,
      subtitle: `${(kpiData.totalCups / 30).toFixed(0)} cup/hari`,
      icon: Coffee,
      trend: `${kpiData.avgAchievement.toFixed(0)}%`,
      trendUp: kpiData.avgAchievement >= 100,
      trendLabel: 'Target',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
    },
    {
      title: `Drivers${getZoneLabel(kpiData.selectedZone)}`,
      value: `${kpiData.totalDrivers}`,
      subtitle: selectedZone === 'all' ? 'dari 50 target' : `di area ${selectedZone}`,
      icon: Users,
      trend: '100%',
      trendUp: true,
      trendLabel: 'Ready',
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
    },
    {
      title: `Target Market${getZoneLabel(kpiData.selectedZone)}`,
      value: `${(kpiData.totalPopulation / 1000).toFixed(0)}K`,
      subtitle: selectedZone === 'all' ? 'Populasi Kembangan' : `di area ${selectedZone}`,
      icon: MapPin,
      trend: '225K',
      trendUp: true,
      trendLabel: 'Produktif',
      gradient: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-50 to-pink-50',
    },
    {
      title: `Achievement${getZoneLabel(kpiData.selectedZone)}`,
      value: `${kpiData.avgAchievement.toFixed(0)}%`,
      subtitle: 'dari 10K/hari',
      icon: Target,
      trend: kpiData.avgAchievement >= 100 ? 'On' : 'Off',
      trendUp: kpiData.avgAchievement >= 100,
      trendLabel: 'Target',
      gradient: 'from-cyan-500 to-teal-600',
      bgGradient: 'from-cyan-50 to-teal-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} border-0 shadow-md card-hover animate-fade-in`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">{card.title}</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 truncate mt-1">{card.value}</h3>
                <p className="text-xs text-gray-500 truncate mt-1">{card.subtitle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    card.trendUp 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {card.trend}
                  </span>
                  {card.trendLabel && (
                    <span className="text-xs text-gray-500">{card.trendLabel}</span>
                  )}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
