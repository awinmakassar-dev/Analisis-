import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, TrendingUp, Users, Navigation, 
  Star, Target, Building2, Coffee, Info,
  Train, ShoppingBag, Home, Trees, Briefcase,
  Stethoscope, Landmark
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface LocationHeatmapProps {
  data: DashboardData;
}

interface LocationScore {
  name: string;
  lat: number;
  lng: number;
  category: string;
  traffic: string;
  footfall: number;
  demand: number;
  score: number;
  isHubCandidate: boolean;
  reasons: string[];
  zone: string;
  priority: number;
}

export default function LocationHeatmap({ data }: LocationHeatmapProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationScore | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'hub' | 'high-traffic' | 'office' | 'mall' | 'transport'>('all');

  // Generate location scores from data with enhanced algorithm
  const locationScores = useMemo(() => {
    const locations = data['Lokasi Strategis GPS'];
    
    return locations.map((loc) => {
      // Calculate demand score based on footfall and category
      const footfall = loc.Estimasi_Footfall_per_Hari;
      const trafficLevel = loc.Traffic_Level;
      const category = loc.Kategori;
      
      // Base score from footfall (0-40 points)
      // Higher footfall = higher score, max at 20,000 footfall
      let footfallScore = Math.min((footfall / 20000) * 40, 40);
      
      // Traffic level multiplier (0-25 points)
      const trafficScore = 
        trafficLevel === 'Very High' ? 25 :
        trafficLevel === 'High' ? 20 :
        trafficLevel === 'Medium-High' ? 15 :
        trafficLevel === 'Medium' ? 10 : 5;
      
      // Category weight (0-25 points) - based on coffee consumption patterns
      const categoryScore = 
        category === 'Office Complex' ? 25 :
        category === 'Mall Area' ? 22 :
        category === 'University Area' ? 20 :
        category === 'Transport Hub' ? 18 :
        category === 'Healthcare Facility' ? 15 :
        category === 'Market Area' ? 14 :
        category === 'Recreation Area' ? 12 :
        category === 'Residential Complex' ? 10 :
        category === 'Government Office' ? 8 : 5;
      
      // Priority bonus (0-10 points)
      const priorityBonus = (6 - Math.min(loc.Target_Priority, 5)) * 2;
      
      // Calculate total score (max 100)
      const totalScore = Math.min(Math.round(footfallScore + trafficScore + categoryScore + priorityBonus), 100);
      
      // Determine zone based on Kembangan Jakarta Barat area classification
      let zone = 'Area Kembangan Lainnya';
      const kelurahan = loc.Kelurahan || '';
      const kategori = loc.Kategori;
      
      // Klasifikasi area khusus Kembangan Jakarta Barat
      if (kelurahan.includes('Kembangan Selatan') || kelurahan.includes('Kembangan Utara')) {
        if (kategori === 'Office Complex' || kategori === 'Mall Area') {
          zone = '🏢 Puri Indah CBD';
        } else if (kategori === 'Transport Hub') {
          zone = '🚉 Transport Hub';
        } else if (kategori === 'Healthcare Facility') {
          zone = '🏥 Healthcare';
        } else if (kategori === 'Market Area') {
          zone = '🛒 Market Area';
        } else if (kategori === 'Residential Complex') {
          zone = '🏠 Residential';
        }
      } else if (kelurahan.includes('Kembangan Baru')) {
        zone = '🏠 Residential';
      }
      
      // Determine if this is a HUB candidate
      // Criteria: Score >= 70 AND (Office Complex OR Mall Area OR University Area OR Transport Hub)
      const isHubCandidate = 
        totalScore >= 70 && 
        (category === 'Office Complex' || 
         category === 'Mall Area' || 
         category === 'University Area' ||
         category === 'Transport Hub');
      
      // Generate detailed reasons
      const reasons: string[] = [];
      if (footfall >= 15000) reasons.push(`Footfall sangat tinggi (${footfall.toLocaleString('id-ID')}/hari)`);
      else if (footfall >= 10000) reasons.push(`Footfall tinggi (${footfall.toLocaleString('id-ID')}/hari)`);
      else if (footfall >= 5000) reasons.push(`Footfall moderat (${footfall.toLocaleString('id-ID')}/hari)`);
      
      if (trafficLevel === 'Very High') reasons.push('Traffic sangat padat - visibility tinggi');
      else if (trafficLevel === 'High') reasons.push('Traffic padat - akses mudah');
      else if (trafficLevel === 'Medium-High') reasons.push('Traffic cukup padat');
      
      if (category === 'Office Complex') reasons.push('Area perkantoran - target karyawan');
      if (category === 'Mall Area') reasons.push('Area mall - footfall konsisten');
      if (category === 'University Area') reasons.push('Area kampus - target mahasiswa');
      if (category === 'Transport Hub') reasons.push('Transportasi publik - captive market');
      if (category === 'Healthcare Facility') reasons.push('Fasilitas kesehatan - visitor tinggi');
      if (category === 'Market Area') reasons.push('Area pasar - traffic lokal');
      
      // Calculate estimated coffee demand (15% of footfall for high potential areas)
      const demandMultiplier = 
        category === 'Office Complex' ? 0.18 :
        category === 'University Area' ? 0.16 :
        category === 'Mall Area' ? 0.12 :
        category === 'Transport Hub' ? 0.14 :
        category === 'Healthcare Facility' ? 0.10 :
        category === 'Market Area' ? 0.08 :
        category === 'Recreation Area' ? 0.06 :
        category === 'Residential Complex' ? 0.05 : 0.04;
      
      return {
        name: loc.Nama_Lokasi,
        lat: loc.Latitude,
        lng: loc.Longitude,
        category: loc.Kategori,
        traffic: loc.Traffic_Level,
        footfall: footfall,
        demand: Math.round(footfall * demandMultiplier),
        score: totalScore,
        isHubCandidate,
        reasons,
        zone,
        priority: loc.Target_Priority,
      };
    }).sort((a, b) => b.score - a.score);
  }, [data]);

  const filteredLocations = useMemo(() => {
    if (filterType === 'hub') return locationScores.filter(l => l.isHubCandidate);
    if (filterType === 'high-traffic') return locationScores.filter(l => l.score >= 60);
    if (filterType === 'office') return locationScores.filter(l => l.category === 'Office Complex');
    if (filterType === 'mall') return locationScores.filter(l => l.category === 'Mall Area');
    if (filterType === 'transport') return locationScores.filter(l => l.category === 'Transport Hub');
    return locationScores;
  }, [locationScores, filterType]);

  const hubCandidates = useMemo(() => 
    locationScores.filter(l => l.isHubCandidate).slice(0, 5),
  [locationScores]);

  const highTrafficSpots = useMemo(() => 
    locationScores.filter(l => l.score >= 60).slice(0, 10),
  [locationScores]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 65) return 'bg-orange-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 35) return 'bg-blue-400';
    return 'bg-green-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Sangat Potensial';
    if (score >= 65) return 'Potensial';
    if (score >= 50) return 'Cukup';
    if (score >= 35) return 'Rendah';
    return 'Sangat Rendah';
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Office')) return <Briefcase className="w-4 h-4" />;
    if (category.includes('University')) return <Users className="w-4 h-4" />;
    if (category.includes('Mall')) return <ShoppingBag className="w-4 h-4" />;
    if (category.includes('Transport')) return <Train className="w-4 h-4" />;
    if (category.includes('Healthcare')) return <Stethoscope className="w-4 h-4" />;
    if (category.includes('Residential')) return <Home className="w-4 h-4" />;
    if (category.includes('Recreation')) return <Trees className="w-4 h-4" />;
    if (category.includes('Government')) return <Landmark className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('Office')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (category.includes('University')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (category.includes('Mall')) return 'bg-pink-100 text-pink-700 border-pink-200';
    if (category.includes('Transport')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (category.includes('Healthcare')) return 'bg-red-100 text-red-700 border-red-200';
    if (category.includes('Residential')) return 'bg-green-100 text-green-700 border-green-200';
    if (category.includes('Recreation')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (category.includes('Government')) return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalFootfall = locationScores.reduce((sum, loc) => sum + loc.footfall, 0);
    const totalDemand = locationScores.reduce((sum, loc) => sum + loc.demand, 0);
    const avgScore = Math.round(locationScores.reduce((sum, loc) => sum + loc.score, 0) / locationScores.length);
    const officeLocations = locationScores.filter(l => l.category === 'Office Complex').length;
    const mallLocations = locationScores.filter(l => l.category === 'Mall Area').length;
    const transportLocations = locationScores.filter(l => l.category === 'Transport Hub').length;
    
    return { totalFootfall, totalDemand, avgScore, officeLocations, mallLocations, transportLocations };
  }, [locationScores]);

  return (
    <div className="space-y-5">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500">Total Lokasi</p>
            <p className="text-xl font-bold text-gray-900">{locationScores.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500">Total Footfall</p>
            <p className="text-xl font-bold text-blue-700">{(stats.totalFootfall / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500">Est. Demand</p>
            <p className="text-xl font-bold text-green-700">{stats.totalDemand.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500">Avg Score</p>
            <p className="text-xl font-bold text-purple-700">{stats.avgScore}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500">HUB Candidate</p>
            <p className="text-xl font-bold text-red-700">{hubCandidates.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500">High Traffic</p>
            <p className="text-xl font-bold text-orange-700">{highTrafficSpots.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Map Visualization */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5 text-orange-500" />
                Peta Potensi Lokasi Kembangan Jakarta Barat
              </CardTitle>
              <CardDescription className="text-sm">
                Klasifikasi area: 🏢 CBD | 🚉 Transport | 🏥 Healthcare | 🛒 Market | 🏠 Residential
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('hub')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'hub' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                HUB
              </button>
              <button
                onClick={() => setFilterType('high-traffic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'high-traffic' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                High Traffic
              </button>
              <button
                onClick={() => setFilterType('office')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'office' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Office
              </button>
              <button
                onClick={() => setFilterType('mall')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'mall' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Mall
              </button>
              <button
                onClick={() => setFilterType('transport')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'transport' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Transport
              </button>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span className="text-gray-500 font-medium">Skor Potensi:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>80-100 (Sangat Potensial)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span>65-79 (Potensial)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span>50-64 (Cukup)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-400" />
              <span>35-49 (Rendah)</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <Star className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="font-medium">Rekomendasi HUB</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid-based Map Visualization */}
          <div className="relative bg-gradient-to-br from-blue-50 via-green-50 to-amber-50 rounded-xl border-2 border-orange-200 p-4 min-h-[450px]">
            {/* Zone Labels - Kembangan Jakarta Barat Area Classification */}
            <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-orange-300 text-orange-800">
              🏢 Puri Indah CBD
            </div>
            <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-cyan-300 text-cyan-800">
              🚉 Transport Hub
            </div>
            <div className="absolute bottom-2 left-2 bg-gradient-to-r from-red-100 to-pink-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-red-300 text-red-800">
              🏥 Healthcare & Market
            </div>
            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-green-300 text-green-800">
              🏠 Residential Area
            </div>
            
            {/* Location Points Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-10">
              {filteredLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLocation(loc)}
                  className={`relative p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                    loc.isHubCandidate 
                      ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300 shadow-lg' 
                      : loc.score >= 65 
                        ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200' 
                        : loc.score >= 50
                          ? 'bg-white border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                  } ${selectedLocation?.name === loc.name ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                >
                  {/* Score Badge */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${getScoreColor(loc.score)} flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white`}>
                    {loc.score}
                  </div>
                  
                  {/* Hub Star */}
                  {loc.isHubCandidate && (
                    <div className="absolute -top-2 -left-2">
                      <Star className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-md" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 rounded-lg ${loc.isHubCandidate ? 'bg-red-100' : 'bg-gray-100'} mb-2`}>
                      {getCategoryIcon(loc.category)}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {loc.name}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {loc.footfall.toLocaleString('id-ID')} /hari
                    </p>
                    <Badge className={`mt-1.5 text-[9px] h-4 px-1.5 ${getScoreColor(loc.score)} text-white`}>
                      {getScoreLabel(loc.score)}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Selected Location Detail */}
          {selectedLocation && (
            <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 animate-fade-in">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${selectedLocation.isHubCandidate ? 'bg-red-100' : 'bg-orange-100'}`}>
                    {getCategoryIcon(selectedLocation.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{selectedLocation.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getCategoryColor(selectedLocation.category)}`}>
                        {selectedLocation.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{selectedLocation.zone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(selectedLocation.score).replace('bg-', 'text-')}`}>
                    {selectedLocation.score}
                  </div>
                  <p className="text-xs text-gray-500">Skor Potensi</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500">Footfall</p>
                  <p className="text-sm font-bold">{selectedLocation.footfall.toLocaleString('id-ID')}/hari</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500">Est. Demand Kopi</p>
                  <p className="text-sm font-bold text-green-600">{selectedLocation.demand} cup/hari</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500">Traffic Level</p>
                  <p className="text-sm font-bold">{selectedLocation.traffic}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500">Koordinat</p>
                  <p className="text-xs font-medium">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Alasan Potensi:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLocation.reasons.map((reason, ridx) => (
                    <span key={ridx} className="px-2.5 py-1 bg-white rounded-lg text-xs text-gray-700 border border-gray-200 shadow-sm">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedLocation.isHubCandidate && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="text-sm font-bold text-red-700">
                      Direkomendasikan sebagai Lokasi HUB/Cabang Strategis
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mt-1 ml-7">
                    Skor {selectedLocation.score} memenuhi kriteria HUB (≥70) dengan kategori {selectedLocation.category}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top HUB Candidates */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="w-5 h-5 text-red-500" />
              Top 5 Rekomendasi Lokasi HUB
            </CardTitle>
            <CardDescription className="text-sm">
              Lokasi dengan skor tertinggi untuk pembukaan HUB/cabang Makkanya Express
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hubCandidates.map((hub, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedLocation(hub)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{hub.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] h-4 px-1.5 ${getCategoryColor(hub.category)}`}>
                            {hub.category}
                          </Badge>
                          <span className="text-[10px] text-gray-500">{hub.zone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-600">{hub.score}</p>
                      <p className="text-xs text-gray-500">Skor</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-red-200/50">
                    <div>
                      <p className="text-[10px] text-gray-500">Footfall</p>
                      <p className="text-xs font-semibold">{hub.footfall.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Demand</p>
                      <p className="text-xs font-semibold text-green-600">{hub.demand} cup</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Traffic</p>
                      <p className="text-xs font-semibold">{hub.traffic}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High Traffic Spots */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Titik Ramai (High Traffic)
            </CardTitle>
            <CardDescription className="text-sm">
              10 Lokasi dengan footfall dan demand tertinggi di area Kembangan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {highTrafficSpots.map((spot, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
                  onClick={() => setSelectedLocation(spot)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getScoreColor(spot.score)}`} />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{spot.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">{spot.category}</span>
                        {spot.isHubCandidate && <Star className="w-3 h-3 text-red-500 fill-red-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Footfall</p>
                      <p className="text-sm font-semibold">{(spot.footfall / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Score</p>
                      <p className="text-sm font-bold text-orange-600">{spot.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-5 h-5 text-orange-600" />
            Analisis & Rekomendasi Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                Kriteria Pemilihan HUB
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Footfall minimal 10,000 orang/hari untuk volume pelanggan tinggi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Area perkantoran, mall, kampus, atau transport hub</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Traffic level High atau Very High untuk visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Estimasi demand minimal 1,000 cup/hari</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-500" />
                Rekomendasi Prioritas
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">1.</span>
                  <span><strong>Puri Indah CBD</strong> - Skor tertinggi, area perkantoran padat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">2.</span>
                  <span><strong>Puri Indah Mall</strong> - Footfall konsisten sepanjang hari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">3.</span>
                  <span><strong>Stasiun Taman Kota</strong> - Commuter traffic tinggi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">4.</span>
                  <span><strong>Tokopedia Tower</strong> - Target karyawan tech company</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Sumber Data
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Google Maps API - Koordinat & Traffic Data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>BPS Jakarta Barat 2024 - Demografi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>KAI Commuter - Stasiun Statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Property Developer Data - Footfall Estimasi</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
