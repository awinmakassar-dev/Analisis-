import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coffee, TrendingUp, DollarSign, Package, 
  Award, Target, Zap, BarChart3, ShoppingCart,
  CheckCircle2, AlertCircle, Star, ChevronRight,
  Users, MapPin
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface ProductAnalysisProps {
  data: DashboardData;
}

export default function ProductAnalysis({ data }: ProductAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'competitor' | 'strategy'>('portfolio');
  
  const products = data['Portfolio Produk'];
  const competitors = data['Analisis Kompetitor'];

  // Calculate portfolio stats
  const portfolioStats = useMemo(() => {
    const coffeeProducts = products.filter(p => p.Kategori === 'Coffee');
    const nonCoffeeProducts = products.filter(p => p.Kategori === 'Non-Coffee');
    const avgMargin = products.reduce((sum, p) => sum + p.Margin_persen, 0) / products.length;
    const avgPrice = products.reduce((sum, p) => sum + p.Harga_Jual_Rp, 0) / products.length;
    const totalProfit = products.reduce((sum, p) => sum + p.Keuntungan_per_Cup, 0);
    const bestSeller = products.sort((a, b) => b.Estimasi_Daily_Sales_persen - a.Estimasi_Daily_Sales_persen)[0];
    const bestMargin = products.sort((a, b) => b.Margin_persen - a.Margin_persen)[0];
    
    return {
      coffeeCount: coffeeProducts.length,
      nonCoffeeCount: nonCoffeeProducts.length,
      avgMargin,
      avgPrice,
      totalProfit,
      bestSeller,
      bestMargin
    };
  }, [products]);

  // Competitor analysis
  const competitorAnalysis = useMemo(() => {
    const sortedByPrice = [...competitors].sort((a, b) => a.Harga_Kopi_Susu_Rp - b.Harga_Kopi_Susu_Rp);
    const cheapest = sortedByPrice[0];
    const mostExpensive = sortedByPrice[sortedByPrice.length - 1];
    const totalCompetitorOutlets = competitors.reduce((sum, c) => sum + c.Jumlah_Outlet_Kembangan, 0);
    
    return {
      cheapest,
      mostExpensive,
      totalCompetitorOutlets,
      makkanyaPosition: sortedByPrice.findIndex(c => c.Brand === 'Makkanya Express') + 1
    };
  }, [competitors]);

  const getCategoryColor = (category: string) => {
    return category === 'Coffee' 
      ? 'bg-amber-100 text-amber-700 border-amber-200' 
      : 'bg-pink-100 text-pink-700 border-pink-200';
  };

  const getThreatColor = (level: string) => {
    if (level === 'High') return 'bg-red-500';
    if (level === 'Medium') return 'bg-orange-500';
    if (level === 'Low-Medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'portfolio' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Portfolio Produk
        </button>
        <button
          onClick={() => setActiveTab('competitor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'competitor' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analisis Kompetitor
        </button>
        <button
          onClick={() => setActiveTab('strategy')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'strategy' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Strategi & Celah Pasar
        </button>
      </div>

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <>
          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">Total Produk</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                <p className="text-[10px] text-gray-400">
                  {portfolioStats.coffeeCount} Coffee, {portfolioStats.nonCoffeeCount} Non-Coffee
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">Avg Margin</p>
                <p className="text-2xl font-bold text-green-700">{portfolioStats.avgMargin.toFixed(1)}%</p>
                <p className="text-[10px] text-gray-400">Sangat Baik</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">Avg Harga</p>
                <p className="text-2xl font-bold text-blue-700">Rp{portfolioStats.avgPrice.toFixed(0)}</p>
                <p className="text-[10px] text-gray-400">Kompetitif</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">Best Seller</p>
                <p className="text-lg font-bold text-purple-700 truncate">{portfolioStats.bestSeller?.Nama_Produk}</p>
                <p className="text-[10px] text-gray-400">{portfolioStats.bestSeller?.Estimasi_Daily_Sales_persen}% penjualan</p>
              </CardContent>
            </Card>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, idx) => (
              <Card key={idx} className="bg-white/90 backdrop-blur-sm border-orange-200/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${product.Kategori === 'Coffee' ? 'bg-amber-100' : 'bg-pink-100'}`}>
                        <Coffee className={`w-5 h-5 ${product.Kategori === 'Coffee' ? 'text-amber-600' : 'text-pink-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{product.Nama_Produk}</h4>
                        <p className="text-xs text-gray-500">{product.Deskripsi}</p>
                      </div>
                    </div>
                    <Badge className={`${getCategoryColor(product.Kategori)} text-[10px]`}>
                      {product.Kategori}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-500">Harga</p>
                      <p className="text-sm font-bold text-gray-900">Rp{product.Harga_Jual_Rp.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-500">Margin</p>
                      <p className="text-sm font-bold text-green-600">{product.Margin_persen}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-500">Profit</p>
                      <p className="text-sm font-bold text-blue-600">Rp{product.Keuntungan_per_Cup.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-500">Prep</p>
                      <p className="text-sm font-bold text-gray-900">{product.Waktu_Preparasi_menit}m</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                    <p className="text-[10px] text-amber-700">
                      <Star className="w-3 h-3 inline mr-1" />
                      <strong>USP:</strong> {product.Unique_Selling_Point}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Competitor Tab */}
      {activeTab === 'competitor' && (
        <>
          {/* Price Comparison Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                Perbandingan Harga Kopi Susu
              </CardTitle>
              <CardDescription className="text-sm">
                Perbandingan harga produk kopi susu utama vs kompetitor di area Kembangan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...competitors, {
                  Brand: 'Makkanya Express',
                  Harga_Kopi_Susu_Rp: 10000,
                  Menu_Utama: 'Makkanya Dreamy Creamy (Aren Latte)'
                }].sort((a, b) => a.Harga_Kopi_Susu_Rp - b.Harga_Kopi_Susu_Rp).map((comp, idx) => {
                  const isMakkanya = comp.Brand === 'Makkanya Express';
                  const maxPrice = 20000;
                  const percentage = (comp.Harga_Kopi_Susu_Rp / maxPrice) * 100;
                  
                  return (
                    <div key={idx} className={`p-3 rounded-xl ${isMakkanya ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{comp.Brand}</span>
                          {isMakkanya && <Badge className="bg-orange-500 text-white text-[10px]">Kita</Badge>}
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          Rp{comp.Harga_Kopi_Susu_Rp.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isMakkanya ? 'bg-orange-500' : 'bg-gray-400'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {comp.Menu_Utama?.split(',')[0] || 'Kopi Susu'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {competitors.map((comp, idx) => (
              <Card key={idx} className="bg-white/90 backdrop-blur-sm border-orange-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">{comp.Brand}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Threat Level:</span>
                      <div className={`w-3 h-3 rounded-full ${getThreatColor(comp.Threat_Level)}`} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-[10px] text-gray-500">Harga Kopi Susu</p>
                      <p className="text-lg font-bold text-gray-900">Rp{comp.Harga_Kopi_Susu_Rp.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-[10px] text-gray-500">Outlet di Kembangan</p>
                      <p className="text-lg font-bold text-gray-900">{comp.Jumlah_Outlet_Kembangan}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-[10px] font-medium text-green-700 mb-1">✅ Strength</p>
                      <p className="text-xs text-green-600">{comp.Strength}</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <p className="text-[10px] font-medium text-red-700 mb-1">❌ Weakness</p>
                      <p className="text-xs text-red-600">{comp.Weakness}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Strategy Tab */}
      {activeTab === 'strategy' && (
        <>
          {/* Market Gap Analysis */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-5 h-5 text-orange-600" />
                Analisis Celah Pasar & Strategi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sweet Spot */}
                <div className="p-4 bg-white rounded-xl border border-orange-200">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-orange-500" />
                    Sweet Spot Makkanya Express
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Harga 10-12K</strong> - Di tengah kompetitor (8K vs 18K)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kualitas Premium</strong> - Rasa di atas Kopi Jago/Sejuta Jiwa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Varian Unik</strong> - Butterscotch, Pistachio, Matcha</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Margin 58-72%</strong> - Lebih baik dari kompetitor</span>
                    </li>
                  </ul>
                </div>

                {/* Target Segments */}
                <div className="p-4 bg-white rounded-xl border border-orange-200">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-500" />
                    Target Segment Prioritas
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Office Workers</strong> - Puri Indah CBD, cari kopi berkualitas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Young Professionals</strong> - Suka varian unik & premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Mall Visitors</strong> - Puri Indah Mall, spending power tinggi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Non-Coffee Drinkers</strong> - Matcha, Choco, Strawberry</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Differentiation Strategy */}
              <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-purple-500" />
                  Strategi Diferensiasi vs Kompetitor
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm font-bold text-amber-800 mb-2">vs Kopi Jago</p>
                    <p className="text-xs text-amber-700">
                      <strong>+2K harga</strong> tapi kualitas jauh lebih baik, varian lebih unik (Butterscotch, Pistachio)
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-bold text-blue-800 mb-2">vs Haus!</p>
                    <p className="text-xs text-blue-700">
                      <strong>Fokus kopi specialist</strong> vs minuman manis. Kualitas espresso lebih baik
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-bold text-green-800 mb-2">vs Kopi Kenangan</p>
                    <p className="text-xs text-green-700">
                      <strong>-6K harga</strong> tapi kualitas comparable. Mobile = lebih accessible
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Rekomendasi Strategi
                </h4>
                <p className="text-sm text-green-800">
                  <strong>Positioning:</strong> "Kopi Premium Harga Terjangkau" - targeting gap antara 
                  kopi murah (8K) dan kopi premium (18K). Fokus pada <strong>Makkanya Dreamy Creamy</strong> sebagai 
                  flagship product (30% penjualan) dan promosikan varian unik (Butterscotch, Pistachio) 
                  sebagai diferensiator. Targetkan lokasi di Puri Indah CBD dan Mall untuk customer 
                  dengan spending power lebih tinggi.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
