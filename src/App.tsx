import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Coffee, TrendingUp, DollarSign, Users,
  Target, Calendar, MapPin, AlertTriangle,
  Filter, RefreshCw, Sun
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Import components
import KPICards from './sections/KPICards';
import RevenueChart from './sections/RevenueChart';
import PerformanceChart from './sections/PerformanceChart';
import DemandHeatmap from './sections/DemandHeatmap';
import LocationHeatmap from './sections/LocationHeatmap';
import ZonePerformance from './sections/ZonePerformance';
import HeatmapSection from './sections/HeatmapSection'; // New Heatmap Component
import ProductAnalysis from './sections/ProductAnalysis';
import CompetitorAnalysis from './sections/CompetitorAnalysis';
import RiskAnalysis from './sections/RiskAnalysis';
import CustomerSegments from './sections/CustomerSegments';
import MonthlyProjection from './sections/MonthlyProjection';
import ClimateImpact from './sections/ClimateImpact';
import TrafficPattern from './sections/TrafficPattern';
import SummaryPanel from './sections/SummaryPanel';
import ZonaOverview from './sections/ZonaOverview';
import ExportData from './components/ExportData';

// Import types
import type { DashboardData } from '@/types/data';

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/makkanya_data.json');
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
        toast.success('Data berhasil dimuat!', { description: 'Dashboard siap digunakan' });
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data', { description: 'Silakan refresh halaman' });
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Smooth filter handlers with loading state
  const handleZoneChange = useCallback((value: string) => {
    setFilterLoading(true);
    setSelectedZone(value);
    setTimeout(() => setFilterLoading(false), 300);
  }, []);

  const handlePeriodChange = useCallback((value: string) => {
    setFilterLoading(true);
    setSelectedPeriod(value);
    setTimeout(() => setFilterLoading(false), 300);
  }, []);

  const handleShiftChange = useCallback((value: string) => {
    setFilterLoading(true);
    setSelectedShift(value);
    setTimeout(() => setFilterLoading(false), 300);
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Data berhasil diperbarui!');
    }, 800);
  }, []);

  // Filtered data based on selections
  const filteredData = useMemo(() => {
    if (!data) return null;

    // Filter locations based on selected zone
    const filteredLocations = (() => {
      const locations = data['Lokasi Strategis GPS'];
      if (selectedZone === 'all') return locations;

      // Map zone filter to location categories
      const zoneCategoryMap: Record<string, string[]> = {
        'Puri Indah CBD': ['Office Complex', 'Mall Area'],
        'Transport Hub': ['Transport Hub'],
        'Healthcare': ['Healthcare Facility'],
        'Market': ['Market Area'],
        'Residential': ['Residential Complex'],
      };

      const allowedCategories = zoneCategoryMap[selectedZone] || [];
      return locations.filter(loc => allowedCategories.includes(loc.Kategori));
    })();

    // Filter heatmap data based on selected zone
    const filteredHeatmap = (() => {
      const heatmapData = data['Heatmap Demand 24 Jam'];
      if (selectedZone === 'all') return heatmapData;

      // Map zone to heatmap zone names
      const zoneHeatmapMap: Record<string, string[]> = {
        'Puri Indah CBD': ['Zona A - Puri Indah CBD', 'Zona C - Mall & Retail'],
        'Transport Hub': ['Zona E - Transport'],
        'Healthcare': ['Zona A - Puri Indah CBD'],
        'Market': ['Zona A - Puri Indah CBD'],
        'Residential': ['Zona D - Residential'],
      };

      const allowedZones = zoneHeatmapMap[selectedZone] || [];
      return heatmapData.filter(h => allowedZones.some(z => h.Zona.includes(z)));
    })();

    return {
      ...data,
      'Lokasi Strategis GPS': filteredLocations,
      'Proyeksi 30 Hari': (() => {
        const dailyData = data['Proyeksi 30 Hari'];
        if (selectedPeriod === '7days') return dailyData.slice(-7);
        if (selectedPeriod === '30days') return dailyData;
        return dailyData;
      })(),
      'Heatmap Demand 24 Jam': filteredHeatmap,
      'Operasional per Shift': (() => {
        const shiftData = data['Operasional per Shift'];
        if (selectedShift === 'all') return shiftData;
        return shiftData.filter(s => s.Shift.toLowerCase().includes(selectedShift.toLowerCase()));
      })(),
    };
  }, [data, selectedZone, selectedPeriod, selectedShift]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-52" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Makkanya Express</h1>
                <p className="text-sm text-gray-600">Dashboard Analisis Bisnis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 h-9 bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <ExportData data={data} />
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar - Contextual based on Active Tab */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-orange-600 flex-shrink-0">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {activeTab === 'overview' && 'Filter Overview:'}
                  {activeTab === 'performance' && 'Filter Performa:'}
                  {activeTab === 'heatmap' && 'Filter Lokasi:'}
                  {activeTab === 'products' && 'Filter Produk:'}
                  {activeTab === 'customers' && 'Filter Pelanggan:'}
                  {activeTab === 'risks' && 'Filter Risiko:'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {/* Zone Filter - Available for all tabs */}
                <Select value={selectedZone} onValueChange={handleZoneChange}>
                  <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm bg-white border-gray-200">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    <SelectValue placeholder="Pilih Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Area Kembangan</SelectItem>
                    <SelectItem value="Puri Indah CBD">🏢 Puri Indah CBD</SelectItem>
                    <SelectItem value="Transport Hub">🚉 Transport Hub</SelectItem>
                    <SelectItem value="Healthcare">🏥 Healthcare</SelectItem>
                    <SelectItem value="Market">🛒 Market Area</SelectItem>
                    <SelectItem value="Residential">🏠 Residential</SelectItem>
                  </SelectContent>
                </Select>

                {/* Period Filter - Overview, Performance */}
                {(activeTab === 'overview' || activeTab === 'performance') && (
                  <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm bg-white border-gray-200">
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      <SelectValue placeholder="Periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                      <SelectItem value="30days">30 Hari</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Shift Filter - Performance, Heatmap */}
                {(activeTab === 'performance' || activeTab === 'heatmap') && (
                  <Select value={selectedShift} onValueChange={handleShiftChange}>
                    <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-white border-gray-200">
                      <Sun className="w-4 h-4 mr-2 text-orange-500" />
                      <SelectValue placeholder="Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Shift</SelectItem>
                      <SelectItem value="Pagi">Pagi (07:00-12:00)</SelectItem>
                      <SelectItem value="Siang">Siang (12:00-17:00)</SelectItem>
                      <SelectItem value="Sore">Sore (17:00-21:00)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Active Filters Display */}
              <div className="flex items-center gap-2 ml-auto">
                {(selectedZone !== 'all' || selectedShift !== 'all' || selectedPeriod !== '30days') && (
                  <Badge variant="secondary" className="text-xs h-6 bg-orange-100 text-orange-700 border-orange-200">
                    {selectedZone !== 'all' && selectedZone}
                    {selectedZone !== 'all' && (selectedShift !== 'all' || selectedPeriod !== '30days') && ' • '}
                    {selectedPeriod !== '30days' && selectedPeriod.replace('days', ' Hari')}
                    {selectedPeriod !== '30days' && selectedShift !== 'all' && ' • '}
                    {selectedShift !== 'all' && `Shift ${selectedShift}`}
                  </Badge>
                )}
                {filterLoading && (
                  <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-6 space-y-5">
        {/* KPI Cards */}
        <div className={`transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
          <KPICards data={filteredData as DashboardData} selectedZone={selectedZone} />
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-5" onValueChange={setActiveTab}>
          <TabsList className="bg-white/90 backdrop-blur-sm p-1.5 border border-orange-200/50 flex-wrap h-auto gap-1 w-full justify-start">
            <TabsTrigger value="overview" className="text-sm px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-sm px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Performa
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-sm px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <MapPin className="w-4 h-4 mr-2" />
              Lokasi & Heatmap
            </TabsTrigger>
            <TabsTrigger value="products" className="text-sm px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Coffee className="w-4 h-4 mr-2" />
              Produk
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-sm px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Pelanggan
            </TabsTrigger>
            <TabsTrigger value="risks" className="text-sm px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risiko
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-5 mt-2">
            {/* Zona Overview - Populasi, Footfall, Demand per Area */}
            <div className={`transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
              <ZonaOverview data={filteredData as DashboardData} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className={`xl:col-span-3 space-y-5 transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <RevenueChart data={filteredData as DashboardData} period={selectedPeriod} />
                  <MonthlyProjection data={filteredData as DashboardData} />
                </div>
                <ZonePerformance data={filteredData as DashboardData} selectedZone={selectedZone} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <ClimateImpact data={filteredData as DashboardData} />
                  <TrafficPattern data={filteredData as DashboardData} />
                </div>
              </div>
              <div className="xl:col-span-1">
                <SummaryPanel data={filteredData as DashboardData} activeTab="overview" selectedZone={selectedZone} />
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-5 mt-2">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className={`xl:col-span-3 space-y-5 transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
                <PerformanceChart data={filteredData as DashboardData} period={selectedPeriod} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CompetitorAnalysis data={filteredData as DashboardData} />
                  <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
                    <CardHeader className="pb-3 space-y-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <DollarSign className="w-5 h-5 text-orange-500" />
                        Break Even Analysis
                      </CardTitle>
                      <CardDescription className="text-sm">Metrik BEP dan profitabilitas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {data['Break Even Analysis'].slice(0, 8).map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-gray-600 leading-tight">{item.Metrik}</p>
                            <p className="text-base font-bold text-orange-700">
                              {typeof item.Nilai === 'number'
                                ? item.Nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 })
                                : item.Nilai}
                            </p>
                            <p className="text-xs text-gray-500">{item.Satuan}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="xl:col-span-1">
                <SummaryPanel data={filteredData as DashboardData} activeTab="performance" selectedZone={selectedZone} />
              </div>
            </div>
          </TabsContent>

          {/* Heatmap Tab - Now with Location Heatmap */}
          <TabsContent value="heatmap" className="space-y-5 mt-2">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className={`xl:col-span-3 space-y-5 transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
                <Card className="overflow-hidden border-orange-200/50 shadow-sm">
                  <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-orange-100">
                    <CardTitle>Peta Potensi & Nilai Lahan</CardTitle>
                    <CardDescription>Visualisasi heatmap potensi bisnis dan estimasi rate per lokasi</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 h-[600px] relative">
                    <HeatmapSection />
                  </CardContent>
                </Card>
                <LocationHeatmap data={filteredData as DashboardData} />
                <DemandHeatmap data={filteredData as DashboardData} selectedZone={selectedZone} />
              </div>
              <div className="xl:col-span-1">
                <SummaryPanel data={filteredData as DashboardData} activeTab="heatmap" selectedZone={selectedZone} />
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-5 mt-2">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className={`xl:col-span-3 transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
                <ProductAnalysis data={filteredData as DashboardData} />
              </div>
              <div className="xl:col-span-1">
                <SummaryPanel data={filteredData as DashboardData} activeTab="products" selectedZone={selectedZone} />
              </div>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-5 mt-2">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className={`xl:col-span-3 transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
                <CustomerSegments data={filteredData as DashboardData} />
              </div>
              <div className="xl:col-span-1">
                <SummaryPanel data={filteredData as DashboardData} activeTab="customers" selectedZone={selectedZone} />
              </div>
            </div>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-5 mt-2">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className={`xl:col-span-3 transition-opacity duration-300 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
                <RiskAnalysis data={filteredData as DashboardData} />
              </div>
              <div className="xl:col-span-1">
                <SummaryPanel data={filteredData as DashboardData} activeTab="risks" selectedZone={selectedZone} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-orange-200/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              © 2024 Makkanya Express. Dashboard Analisis Bisnis.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs h-6">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                Real-time
              </Badge>
              <span className="text-xs text-gray-500">
                Update: {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
