import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin } from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface CompetitorAnalysisProps {
  data: DashboardData;
}

export default function CompetitorAnalysis({ data }: CompetitorAnalysisProps) {
  const competitorData = useMemo(() => {
    return data['Analisis Kompetitor'].map(c => ({
      name: c.Brand,
      model: c.Model_Bisnis,
      price: c.Harga_Kopi_Susu_Rp,
      outlets: c.Jumlah_Outlet_Kembangan,
      segment: c.Target_Segment,
      strength: c.Strength,
      weakness: c.Weakness,
      threat: c.Threat_Level,
    }));
  }, [data]);

  const priceComparison = useMemo(() => {
    return competitorData
      .filter(c => c.name !== 'Kopi Jago (Benchmark)')
      .map(c => ({
        name: c.name,
        price: c.price,
        outlets: c.outlets,
        threat: c.threat,
      }))
      .sort((a, b) => b.price - a.price);
  }, [competitorData]);

  const getThreatBadge = (threat: string) => {
    if (threat === 'High') return <Badge className="bg-red-500 text-white text-xs h-5 px-2">High</Badge>;
    if (threat === 'Medium') return <Badge className="bg-yellow-500 text-white text-xs h-5 px-2">Medium</Badge>;
    return <Badge className="bg-green-500 text-white text-xs h-5 px-2">Low</Badge>;
  };

  const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#fbbf24'];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm h-full">
      <CardHeader className="pb-3 space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Store className="w-5 h-5 text-orange-500" />
          Analisis Kompetitor
        </CardTitle>
        <CardDescription className="text-sm">Pemetaan kompetisi di area Kembangan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-44 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceComparison} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
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
                fontSize={10}
                width={80}
                tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
              />
              <Tooltip 
                formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Harga']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="price" name="Harga" radius={[0, 4, 4, 0]}>
                {priceComparison.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor Details */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {competitorData.map((comp, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border ${
                comp.name === 'Kopi Jago (Benchmark)' 
                  ? 'bg-orange-50 border-orange-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-600" />
                  <span className={`text-sm font-medium ${
                    comp.name === 'Kopi Jago (Benchmark)' ? 'text-orange-700' : 'text-gray-900'
                  }`}>
                    {comp.name}
                  </span>
                </div>
                {getThreatBadge(comp.threat)}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div>
                  <span className="text-gray-500">Model:</span>
                  <span className="ml-1 font-medium">{comp.model}</span>
                </div>
                <div>
                  <span className="text-gray-500">Outlet:</span>
                  <span className="ml-1 font-medium">{comp.outlets}</span>
                </div>
                <div>
                  <span className="text-gray-500">Segment:</span>
                  <span className="ml-1 font-medium">{comp.segment}</span>
                </div>
                <div>
                  <span className="text-gray-500">Harga:</span>
                  <span className="ml-1 font-medium">Rp {comp.price.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Kompetitor</p>
            <p className="text-lg font-bold text-gray-900">{competitorData.length - 1}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">High Threat</p>
            <p className="text-lg font-bold text-red-600">
              {competitorData.filter(c => c.threat === 'High' && c.name !== 'Kopi Jago (Benchmark)').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Avg Harga</p>
            <p className="text-base font-bold text-orange-600">
              Rp{Math.round(
                competitorData
                  .filter(c => c.name !== 'Kopi Jago (Benchmark)')
                  .reduce((sum, c) => sum + c.price, 0) / 
                (competitorData.length - 1)
              ).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Outlet</p>
            <p className="text-lg font-bold text-blue-600">
              {competitorData
                .filter(c => c.name !== 'Kopi Jago (Benchmark)')
                .reduce((sum, c) => sum + c.outlets, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
