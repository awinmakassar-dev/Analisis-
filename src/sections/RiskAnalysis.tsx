import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, Shield, AlertCircle, CheckCircle2, 
  CloudRain, TrafficCone, Scale, Users, Zap
} from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface RiskAnalysisProps {
  data: DashboardData;
}

export default function RiskAnalysis({ data }: RiskAnalysisProps) {
  const riskData = useMemo(() => {
    return data['Risk Register Detailed'].map(r => ({
      id: r.Risk_ID,
      category: r.Kategori_Risiko,
      description: r.Risk_Description.substring(0, 60) + '...',
      fullDescription: r.Risk_Description,
      probability: r.Probability,
      impact: r.Impact,
      score: r.Risk_Score,
      mitigation: r.Mitigation_Strategy,
      contingency: r.Contingency_Plan,
      owner: r.Owner,
      status: r.Status,
    }));
  }, [data]);

  const riskMatrix = useMemo(() => {
    return riskData.map(r => ({
      x: r.probability.includes('High') ? 3 : r.probability.includes('Medium') ? 2 : 1,
      y: r.impact === 'High' ? 3 : r.impact === 'Medium' ? 2 : 1,
      z: r.score,
      name: r.id,
      category: r.category,
    }));
  }, [riskData]);

  const categoryCounts = useMemo(() => {
    const counts = riskData.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [riskData]);

  const getRiskBadge = (score: number) => {
    if (score >= 9) return <Badge className="bg-red-500 text-white text-xs h-5 px-2">Critical</Badge>;
    if (score >= 7) return <Badge className="bg-orange-500 text-white text-xs h-5 px-2">High</Badge>;
    if (score >= 5) return <Badge className="bg-yellow-500 text-white text-xs h-5 px-2">Medium</Badge>;
    return <Badge className="bg-green-500 text-white text-xs h-5 px-2">Low</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Cuaca')) return <CloudRain className="w-4 h-4" />;
    if (category.includes('Traffic')) return <TrafficCone className="w-4 h-4" />;
    if (category.includes('Regulasi')) return <Scale className="w-4 h-4" />;
    if (category.includes('HR')) return <Users className="w-4 h-4" />;
    if (category.includes('Technology')) return <Zap className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const COLORS = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-5">
      {/* Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Risk Matrix
            </CardTitle>
            <CardDescription className="text-sm">Probabilitas vs Impact (Score: 1-10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 15, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Probability" 
                    domain={[0.5, 3.5]}
                    tickFormatter={(value) => {
                      if (value === 1) return 'Low';
                      if (value === 2) return 'Med';
                      if (value === 3) return 'High';
                      return '';
                    }}
                    stroke="#9ca3af"
                    fontSize={11}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Impact" 
                    domain={[0.5, 3.5]}
                    tickFormatter={(value) => {
                      if (value === 1) return 'Low';
                      if (value === 2) return 'Med';
                      if (value === 3) return 'High';
                      return '';
                    }}
                    stroke="#9ca3af"
                    fontSize={11}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2.5 rounded-lg shadow-lg border border-orange-200 text-xs">
                            <p className="font-semibold text-gray-900">{data.name}</p>
                            <p className="text-gray-600">{data.category}</p>
                            <p className="font-medium text-orange-600">Score: {data.z}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Risks" data={riskMatrix} fill="#f97316">
                    {riskMatrix.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.z >= 9 ? '#ef4444' : entry.z >= 7 ? '#f97316' : entry.z >= 5 ? '#fbbf24' : '#22c55e'} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600">Critical (9-10)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-orange-500" />
                <span className="text-xs text-gray-600">High (7-8)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                <span className="text-xs text-gray-600">Medium (5-6)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600">Low (1-4)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-orange-500" />
              Risk by Category
            </CardTitle>
            <CardDescription className="text-sm">Distribusi risiko per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryCounts} layout="vertical" margin={{ left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={10} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#9ca3af" 
                    fontSize={9}
                    width={70}
                  />
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="count" name="Risiko" radius={[0, 4, 4, 0]}>
                    {categoryCounts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-3">
              {categoryCounts.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{cat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Details */}
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Detail Risiko
          </CardTitle>
          <CardDescription className="text-sm">Daftar risiko dan strategi mitigasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {riskData.map((risk, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border ${
                  risk.score >= 9 ? 'bg-red-50 border-red-200' :
                  risk.score >= 7 ? 'bg-orange-50 border-orange-200' :
                  risk.score >= 5 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${
                      risk.score >= 9 ? 'bg-red-500' :
                      risk.score >= 7 ? 'bg-orange-500' :
                      risk.score >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white`}>
                      {getCategoryIcon(risk.category)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{risk.id}</span>
                      <span className="text-xs text-gray-500 ml-2">{risk.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRiskBadge(risk.score)}
                    <Badge variant="outline" className="text-xs h-5 px-2">{risk.status}</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{risk.fullDescription}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-white/70 rounded">
                    <p className="text-gray-500 mb-1 flex items-center gap-1.5 text-xs">
                      <Shield className="w-3.5 h-3.5" />
                      Mitigasi
                    </p>
                    <p className="text-gray-700 text-xs line-clamp-2">{risk.mitigation}</p>
                  </div>
                  <div className="p-2 bg-white/70 rounded">
                    <p className="text-gray-500 mb-1 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Contingency
                    </p>
                    <p className="text-gray-700 text-xs line-clamp-2">{risk.contingency}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Owner: <span className="font-medium text-gray-700">{risk.owner}</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      Prob: <span className="font-medium text-gray-700">{risk.probability}</span>
                    </span>
                    <span className="text-gray-500">
                      Impact: <span className="font-medium text-gray-700">{risk.impact}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
