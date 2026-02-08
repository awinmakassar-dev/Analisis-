import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, 
  Target, DollarSign, Users, Coffee, MapPin, Calendar,
  AlertTriangle, Shield, Zap, BarChart3
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface SummaryPanelProps {
  data: DashboardData;
  activeTab: string;
  selectedZone?: string;
}

export default function SummaryPanel({ data, activeTab, selectedZone = 'all' }: SummaryPanelProps) {
  const summaryContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSummary data={data} selectedZone={selectedZone} />;
      case 'performance':
        return <PerformanceSummary data={data} selectedZone={selectedZone} />;
      case 'heatmap':
        return <HeatmapSummary data={data} selectedZone={selectedZone} />;
      case 'products':
        return <ProductSummary data={data} selectedZone={selectedZone} />;
      case 'customers':
        return <CustomerSummary data={data} selectedZone={selectedZone} />;
      case 'risks':
        return <RiskSummary data={data} selectedZone={selectedZone} />;
      default:
        return <OverviewSummary data={data} selectedZone={selectedZone} />;
    }
  }, [data, activeTab, selectedZone]);

  const getZoneLabel = (zone: string) => {
    if (zone === 'all') return 'Kembangan';
    return zone;
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-md sticky top-24">
      <CardHeader className="pb-3 border-b border-orange-200/50">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          Ringkasan {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </CardTitle>
        {selectedZone !== 'all' && (
          <p className="text-xs text-orange-600 mt-1">
            📍 Area: {getZoneLabel(selectedZone)}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {summaryContent}
      </CardContent>
    </Card>
  );
}

// Overview Summary
function OverviewSummary({ data, selectedZone = 'all' }: { data: DashboardData; selectedZone?: string }) {
  const dailyData = data['Proyeksi 30 Hari'];
  const monthlyData = data['KPI Bulanan 12 Bulan'];
  const locations = data['Lokasi Strategis GPS'];
  
  // Calculate zone multiplier
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
  const profitMargin = latestMonth?.Profit_Margin_persen || 0;
  
  // Calculate trend
  const firstHalf = dailyData.slice(0, 15).reduce((sum, d) => sum + d.Revenue_Rp, 0) / 15;
  const secondHalf = dailyData.slice(15).reduce((sum, d) => sum + d.Revenue_Rp, 0) / 15;
  const trend = ((secondHalf - firstHalf) / firstHalf) * 100;

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="space-y-3">
        <div className="p-3 bg-white rounded-lg border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">Rp{(totalRevenue / 1000000).toFixed(1)}M</p>
          <div className="flex items-center gap-1 mt-1">
            {trend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs periode lalu
            </span>
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-lg border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Net Profit</span>
            <Target className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">Rp{(totalProfit / 1000000).toFixed(1)}M</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Margin</span>
              <span className="font-medium">{profitMargin.toFixed(1)}%</span>
            </div>
            <Progress value={profitMargin} className="h-2" />
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-lg border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cup Terjual</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{(totalCups / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-500 mt-1">
            Rata-rata {(totalCups / 30).toFixed(0)} cup/hari
          </p>
        </div>
      </div>
      
      {/* Achievement */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Achievement Rate</span>
          <CheckCircle2 className={`w-4 h-4 ${avgAchievement >= 100 ? 'text-green-500' : 'text-orange-500'}`} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{avgAchievement.toFixed(1)}%</p>
        <div className="mt-2">
          <Progress value={Math.min(avgAchievement, 100)} className="h-2" />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {avgAchievement >= 100 
            ? 'Target tercapai! Performa sangat baik.' 
            : `Masih ${(100 - avgAchievement).toFixed(1)}% lagi untuk mencapai target.`}
        </p>
      </div>
      
      {/* Insight */}
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm font-medium text-amber-800 mb-1">💡 Insight</p>
        <p className="text-xs text-amber-700">
          Bisnis menunjukkan tren {trend >= 0 ? 'positif' : 'yang perlu perhatian'} dengan 
          profit margin {profitMargin.toFixed(1)}%. 
          {avgAchievement >= 100 
            ? 'Pertahankan strategi yang sudah berjalan.' 
            : 'Fokus pada peningkatan operasional untuk mencapai target.'}
        </p>
      </div>
    </div>
  );
}

// Performance Summary
function PerformanceSummary({ data, selectedZone = 'all' }: { data: DashboardData; selectedZone?: string }) {
  const shiftData = data['Operasional per Shift'];
  const monthlyData = data['KPI Bulanan 12 Bulan'];
  const locations = data['Lokasi Strategis GPS'];
  
  // Calculate zone multiplier
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
  
  // Shift analysis
  const shiftTotals = shiftData.reduce((acc, curr) => {
    acc[curr.Shift] = (acc[curr.Shift] || 0) + curr.Total_Cup_Shift;
    return acc;
  }, {} as Record<string, number>);
  
  const bestShift = Object.entries(shiftTotals).sort((a, b) => b[1] - a[1])[0];
  
  // Monthly trend
  const avgMonthlyRevenue = monthlyData.reduce((sum, m) => sum + m.Revenue_Rp, 0) / monthlyData.length * zoneMultiplier;
  const avgMonthlyProfit = monthlyData.reduce((sum, m) => sum + m.Net_Profit_Rp, 0) / monthlyData.length * zoneMultiplier;
  
  // ROI calculation
  const investment = data['Investment Breakdown'].reduce((sum, i) => sum + i.Total_Biaya_Rp, 0);
  const annualProfit = avgMonthlyProfit * 12;
  const roi = (annualProfit / investment) * 100;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Shift Terbaik</p>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-lg font-bold text-gray-900">{bestShift?.[0]}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {bestShift?.[1].toLocaleString('id-ID')} cup terjual
        </p>
      </div>
      
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Avg Revenue/Bulan</p>
        <p className="text-xl font-bold text-gray-900">
          Rp{(avgMonthlyRevenue / 1000000000).toFixed(2)}B
        </p>
      </div>
      
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">ROI Tahunan</p>
        <p className="text-2xl font-bold text-green-600">{roi.toFixed(1)}%</p>
        <div className="mt-2">
          <Progress value={Math.min(roi, 100)} className="h-2" />
        </div>
      </div>
      
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-green-800 mb-1">✅ Performa</p>
        <p className="text-xs text-green-700">
          Shift {bestShift?.[0]} adalah waktu paling produktif. 
          Pertimbangkan untuk menambah driver pada shift ini.
        </p>
      </div>
    </div>
  );
}

// Heatmap Summary - Enhanced with accurate location data
function HeatmapSummary({ data, selectedZone = 'all' }: { data: DashboardData; selectedZone?: string }) {
  const heatmapData = data['Heatmap Demand 24 Jam'];
  const locations = data['Lokasi Strategis GPS'];
  const customers = data['Customer Detailed Real'];
  
  // Filter locations by selected zone
  const zoneCategoryMap: Record<string, string[]> = {
    'Puri Indah CBD': ['Office Complex', 'Mall Area'],
    'Transport Hub': ['Transport Hub'],
    'Healthcare': ['Healthcare Facility'],
    'Market': ['Market Area'],
    'Residential': ['Residential Complex'],
  };
  
  const filteredLocations = selectedZone === 'all' 
    ? locations 
    : locations.filter(loc => (zoneCategoryMap[selectedZone] || []).includes(loc.Kategori));
  
  // Find peak hours
  const hourlyDemand = heatmapData.reduce((acc, curr) => {
    acc[curr.Jam] = (acc[curr.Jam] || 0) + curr.Demand_Index;
    return acc;
  }, {} as Record<number, number>);
  
  const peakHour = Object.entries(hourlyDemand).sort((a, b) => b[1] - a[1])[0];
  
  // Calculate location statistics
  const totalFootfall = filteredLocations.reduce((sum, l) => sum + l.Estimasi_Footfall_per_Hari, 0);
  const veryHighTraffic = filteredLocations.filter(l => l.Traffic_Level === 'Very High').length;
  const highTraffic = filteredLocations.filter(l => l.Traffic_Level === 'High').length;
  const hubCandidates = filteredLocations.filter(l => 
    l.Estimasi_Footfall_per_Hari >= 10000 && 
    (l.Kategori === 'Office Complex' || l.Kategori === 'Mall Area' || l.Kategori === 'Transport Hub')
  );
  
  // Top locations by footfall
  const topLocations = [...filteredLocations].sort((a, b) => b.Estimasi_Footfall_per_Hari - a.Estimasi_Footfall_per_Hari).slice(0, 3);
  
  // Total potential demand from customers (filtered by zone)
  const zoneMultiplier = selectedZone === 'all' ? 1 : filteredLocations.length / locations.length;
  const totalDemand = customers.reduce((sum, c) => sum + c.Estimated_Daily_Coffee_Demand_Cups, 0) * zoneMultiplier;
  
  // Total driver needed
  const totalDriverNeeded = Math.round(heatmapData.reduce((sum, h) => sum + h.Recommended_Driver, 0) * zoneMultiplier);

  return (
    <div className="space-y-4">
      {/* Peak Hour */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Jam Puncak (Peak)</p>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          <span className="text-lg font-bold text-gray-900">
            {peakHour?.[0].toString().padStart(2, '0')}:00
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Demand index: {peakHour?.[1]}
        </p>
      </div>
      
      {/* Location Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-white rounded-lg border border-orange-100 text-center">
          <p className="text-xs text-gray-500">Total Footfall</p>
          <p className="text-lg font-bold text-blue-600">
            {(totalFootfall / 1000).toFixed(0)}K
          </p>
          <p className="text-[10px] text-gray-400">/hari</p>
        </div>
        <div className="p-2 bg-white rounded-lg border border-orange-100 text-center">
          <p className="text-xs text-gray-500">Potensi Demand</p>
          <p className="text-lg font-bold text-green-600">
            {totalDemand.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-gray-400">cup/hari</p>
        </div>
      </div>
      
      {/* Traffic Distribution */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Distribusi Traffic</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Very High</span>
            <Badge className="bg-red-500 text-white text-[10px]">{veryHighTraffic} lokasi</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">High</span>
            <Badge className="bg-orange-500 text-white text-[10px]">{highTraffic} lokasi</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">HUB Candidate</span>
            <Badge className="bg-purple-500 text-white text-[10px]">{hubCandidates.length} lokasi</Badge>
          </div>
        </div>
      </div>
      
      {/* Top Locations */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Top 3 Lokasi (Footfall)</p>
        <div className="space-y-1.5">
          {topLocations.map((loc, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-700 truncate max-w-[140px]">{loc.Nama_Lokasi}</span>
              <span className="text-orange-600 font-semibold">
                {(loc.Estimasi_Footfall_per_Hari / 1000).toFixed(1)}K
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommendation */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <p className="text-sm font-bold text-blue-800 mb-1">📍 Rekomendasi HUB</p>
        <p className="text-xs text-blue-700 mb-2">
          Prioritas lokasi HUB berdasarkan analisis data:
        </p>
        <ul className="space-y-1">
          {hubCandidates.slice(0, 3).map((hub, idx) => (
            <li key={idx} className="flex items-center gap-1.5 text-xs text-blue-700">
              <span className="font-bold">{idx + 1}.</span>
              <span className="truncate">{hub.Nama_Lokasi}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Product Summary - Updated for Makkanya Express
function ProductSummary({ data, selectedZone = 'all' }: { data: DashboardData; selectedZone?: string }) {
  const products = data['Portfolio Produk'];
  const competitors = data['Analisis Kompetitor'];
  const locations = data['Lokasi Strategis GPS'];
  
  // Calculate zone-specific product performance
  const zoneCategoryMap: Record<string, string[]> = {
    'Puri Indah CBD': ['Office Complex', 'Mall Area'],
    'Transport Hub': ['Transport Hub'],
    'Healthcare': ['Healthcare Facility'],
    'Market': ['Market Area'],
    'Residential': ['Residential Complex'],
  };
  
  // Adjust product sales percentage based on zone characteristics
  let zoneAdjustment = 1;
  if (selectedZone !== 'all') {
    // Office areas prefer coffee more, residential has more non-coffee preference
    if (selectedZone === 'Puri Indah CBD') zoneAdjustment = 1.2; // Higher coffee demand
    else if (selectedZone === 'Transport Hub') zoneAdjustment = 1.1; // Quick coffee
    else if (selectedZone === 'Residential') zoneAdjustment = 0.9; // More non-coffee
  }
  
  // Top product by margin
  const topMargin = [...products].sort((a, b) => b.Margin_persen - a.Margin_persen)[0];
  
  // Best seller (adjusted for zone)
  const bestSeller = [...products].sort((a, b) => b.Estimasi_Daily_Sales_persen - a.Estimasi_Daily_Sales_persen)[0];
  
  // Average metrics
  const avgMargin = products.reduce((sum, p) => sum + p.Margin_persen, 0) / products.length;
  const avgPrice = products.reduce((sum, p) => sum + p.Harga_Jual_Rp, 0) / products.length;
  
  // Category breakdown
  const coffeeCount = products.filter(p => p.Kategori === 'Coffee').length;
  const nonCoffeeCount = products.filter(p => p.Kategori === 'Non-Coffee').length;
  
  // Competitor price comparison
  const cheapestCompetitor = [...competitors].sort((a, b) => a.Harga_Kopi_Susu_Rp - b.Harga_Kopi_Susu_Rp)[0];
  const mostExpensiveCompetitor = [...competitors].sort((a, b) => b.Harga_Kopi_Susu_Rp - a.Harga_Kopi_Susu_Rp)[0];

  return (
    <div className="space-y-4">
      {/* Best Seller */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">⭐ Best Seller</p>
        <p className="text-base font-bold text-gray-900">{bestSeller?.Nama_Produk}</p>
        <p className="text-xs text-gray-500 mt-1">{bestSeller?.Deskripsi}</p>
        <Badge className="mt-1 bg-amber-500 text-white text-[10px]">
          {bestSeller?.Estimasi_Daily_Sales_persen}% penjualan
        </Badge>
      </div>
      
      {/* Highest Margin */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">💰 Margin Tertinggi</p>
        <p className="text-base font-bold text-gray-900">{topMargin?.Nama_Produk}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className="bg-green-500 text-white">
            {topMargin?.Margin_persen}% margin
          </Badge>
          <span className="text-xs text-gray-500">
            Rp{topMargin?.Keuntungan_per_Cup.toLocaleString('id-ID')}/cup
          </span>
        </div>
      </div>
      
      {/* Portfolio Breakdown */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">📦 Portfolio Produk</p>
        <div className="flex gap-2 mb-2">
          <Badge className="bg-amber-100 text-amber-700">{coffeeCount} Coffee</Badge>
          <Badge className="bg-pink-100 text-pink-700">{nonCoffeeCount} Non-Coffee</Badge>
        </div>
        <div className="space-y-1">
          {products.slice(0, 4).map((p, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="text-gray-600 truncate max-w-[120px]">{p.Nama_Produk}</span>
              <span className="font-medium text-orange-600">Rp{p.Harga_Jual_Rp.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Price Positioning */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">📊 Posisi Harga</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Termurah (Kopi Jago)</span>
            <span className="font-medium">Rp{cheapestCompetitor?.Harga_Kopi_Susu_Rp.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center text-xs bg-orange-50 p-1.5 rounded">
            <span className="text-orange-700 font-medium">Makkanya Express</span>
            <span className="font-bold text-orange-700">Rp10.000-12.000</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Termahal (Kopi Kenangan)</span>
            <span className="font-medium">Rp{mostExpensiveCompetitor?.Harga_Kopi_Susu_Rp.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-white rounded-lg border border-orange-100 text-center">
          <p className="text-xs text-gray-500">Avg Margin</p>
          <p className="text-lg font-bold text-green-600">{avgMargin.toFixed(1)}%</p>
        </div>
        <div className="p-2 bg-white rounded-lg border border-orange-100 text-center">
          <p className="text-xs text-gray-500">Avg Harga</p>
          <p className="text-lg font-bold text-orange-600">
            Rp{(avgPrice / 1000).toFixed(0)}K
          </p>
        </div>
      </div>
      
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm font-medium text-purple-800 mb-1">☕ Strategi Produk</p>
        <p className="text-xs text-purple-700">
          Fokus promosi pada <strong>{bestSeller?.Nama_Produk}</strong> sebagai flagship product. 
          <strong>{topMargin?.Nama_Produk}</strong> memberikan margin terbaik.
        </p>
      </div>
    </div>
  );
}

// Customer Summary - Enhanced with accurate data
function CustomerSummary({ data, selectedZone = 'all' }: { data: DashboardData; selectedZone?: string }) {
  const segments = data['Customer Segmentation'];
  const detailSegments = data['Customer Detailed Real'];
  const locations = data['Lokasi Strategis GPS'];
  
  // Calculate zone multiplier
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
  
  // Largest segment
  const largestSegment = [...segments].sort((a, b) => b.Estimasi_Populasi - a.Estimasi_Populasi)[0];
  
  // Highest LTV segment
  const highestLTV = [...segments].sort((a, b) => b.Lifetime_Value_3bulan - a.Lifetime_Value_3bulan)[0];
  
  // Total target population (filtered by zone)
  const totalTargetPop = detailSegments.reduce((sum, s) => sum + s.Populasi_Target_Coffee_Drinkers, 0) * zoneMultiplier;
  
  // Total potential demand (filtered by zone)
  const totalDemand = detailSegments.reduce((sum, s) => sum + s.Estimated_Daily_Coffee_Demand_Cups, 0) * zoneMultiplier;
  
  // Average income
  const avgIncome = detailSegments.reduce((sum, s) => sum + s.Income_Level_Rata_Rata_Rp, 0) / detailSegments.length;
  
  // Peak hours analysis
  const allPeakHours = detailSegments.flatMap(s => s.Peak_Hours.split(', '));
  const peakHourCounts = allPeakHours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommonPeakHour = Object.entries(peakHourCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      {/* Target Market */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Total Target Market</p>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          <span className="text-xl font-bold text-gray-900">
            {(totalTargetPop / 1000).toFixed(1)}K
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Coffee drinkers di area Kembangan
        </p>
      </div>
      
      {/* Potential Demand */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Potensi Demand Harian</p>
        <p className="text-2xl font-bold text-green-600">
          {totalDemand.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-gray-500 mt-1">cup/hari dari semua segment</p>
      </div>
      
      {/* Segment Breakdown */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Breakdown Segment</p>
        <div className="space-y-2">
          {detailSegments.slice(0, 4).map((seg, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="text-gray-600 truncate max-w-[120px]">{seg.Nama_Segment_Utama}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{(seg.Populasi_Target_Coffee_Drinkers / 1000).toFixed(1)}K</span>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${(seg.Populasi_Target_Coffee_Drinkers / totalTargetPop) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Key Insights */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-white rounded-lg border border-orange-100 text-center">
          <p className="text-xs text-gray-500">Avg Income</p>
          <p className="text-base font-bold text-purple-600">
            Rp{(avgIncome / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="p-2 bg-white rounded-lg border border-orange-100 text-center">
          <p className="text-xs text-gray-500">Peak Hour</p>
          <p className="text-base font-bold text-orange-600">
            {mostCommonPeakHour?.[0].split('-')[0] || '07:00'}
          </p>
        </div>
      </div>
      
      {/* Top Segments */}
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">🏆 Segment Prioritas</p>
        <div className="space-y-2">
          <div className="p-2 bg-amber-50 rounded-lg">
            <p className="text-xs font-medium text-amber-800">LTV Tertinggi</p>
            <p className="text-sm font-bold text-gray-900">{highestLTV?.Nama_Segment}</p>
            <p className="text-xs text-amber-600">
              Rp{highestLTV?.Lifetime_Value_3bulan.toLocaleString('id-ID')}/3bln
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-800">Populasi Terbesar</p>
            <p className="text-sm font-bold text-gray-900">{largestSegment?.Nama_Segment}</p>
            <p className="text-xs text-blue-600">
              {(largestSegment?.Estimasi_Populasi || 0 / 1000).toFixed(1)}K orang
            </p>
          </div>
        </div>
      </div>
      
      {/* Strategy */}
      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <p className="text-sm font-bold text-indigo-800 mb-1">👥 Strategi Customer</p>
        <p className="text-xs text-indigo-700">
          Fokus pada <strong>{largestSegment?.Nama_Segment}</strong> sebagai segment utama. 
          {highestLTV?.Nama_Segment} memiliki LTV tertinggi untuk program loyalty.
        </p>
      </div>
    </div>
  );
}

// Risk Summary
function RiskSummary({ data, selectedZone = 'all' }: { data: DashboardData; selectedZone?: string }) {
  const risks = data['Risk Register Detailed'];
  
  // Filter risks by zone if applicable
  const zoneRiskMap: Record<string, string[]> = {
    'Puri Indah CBD': ['Kompetisi', 'Operasional', 'SDM'],
    'Transport Hub': ['Operasional', 'Regulasi', 'Cuaca'],
    'Healthcare': ['Operasional', 'SDM'],
    'Market': ['Kompetisi', 'Operasional'],
    'Residential': ['Operasional', 'Permintaan'],
  };
  
  const filteredRisks = selectedZone === 'all' 
    ? risks 
    : risks.filter(r => (zoneRiskMap[selectedZone] || []).includes(r.Kategori_Risiko));
  
  // Risk counts by level
  const criticalRisks = filteredRisks.filter(r => r.Risk_Score >= 9);
  const highRisks = filteredRisks.filter(r => r.Risk_Score >= 7 && r.Risk_Score < 9);
  const mediumRisks = filteredRisks.filter(r => r.Risk_Score >= 5 && r.Risk_Score < 7);
  
  // Top risk
  const topRisk = [...filteredRisks].sort((a, b) => b.Risk_Score - a.Risk_Score)[0];
  
  // Risk by category
  const categoryCounts = filteredRisks.reduce((acc, r) => {
    acc[r.Kategori_Risiko] = (acc[r.Kategori_Risiko] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-center">
          <p className="text-xs text-gray-500">Critical</p>
          <p className="text-xl font-bold text-red-600">{criticalRisks.length}</p>
        </div>
        <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
          <p className="text-xs text-gray-500">High</p>
          <p className="text-xl font-bold text-orange-600">{highRisks.length}</p>
        </div>
        <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
          <p className="text-xs text-gray-500">Medium</p>
          <p className="text-xl font-bold text-yellow-600">{mediumRisks.length}</p>
        </div>
      </div>
      
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Risiko Tertinggi</p>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">{topRisk?.Risk_Description.substring(0, 50)}...</p>
            <Badge className="mt-1 bg-red-500 text-white text-xs">
              Score: {topRisk?.Risk_Score}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-white rounded-lg border border-orange-100">
        <p className="text-sm text-gray-600 mb-2">Kategori Risiko Dominan</p>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          <span className="text-base font-bold text-gray-900">{topCategory?.[0]}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {topCategory?.[1]} risiko teridentifikasi
        </p>
      </div>
      
      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm font-medium text-red-800 mb-1">⚠️ Perhatian</p>
        <p className="text-xs text-red-700">
          {criticalRisks.length > 0 
            ? `${criticalRisks.length} risiko critical memerlukan mitigasi segera.` 
            : 'Tidak ada risiko critical. Tetap waspada terhadap risiko high.'}
        </p>
      </div>
    </div>
  );
}
