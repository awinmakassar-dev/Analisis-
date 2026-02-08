import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Info, MapPin } from 'lucide-react';
import type { DashboardData } from '@/types/data';

interface DemandHeatmapProps {
  data: DashboardData;
  selectedZone: string;
}

export default function DemandHeatmap({ data, selectedZone }: DemandHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{zone: string, hour: number, value: number} | null>(null);

  const heatmapData = useMemo(() => {
    const demandData = data['Heatmap Demand 24 Jam'];
    
    const grouped = demandData.reduce((acc: any, curr) => {
      if (!acc[curr.Zona]) {
        acc[curr.Zona] = [];
      }
      acc[curr.Zona].push(curr);
      return acc;
    }, {});
    
    Object.keys(grouped).forEach(zone => {
      grouped[zone].sort((a: any, b: any) => a.Jam - b.Jam);
    });
    
    return grouped;
  }, [data]);

  const zones = useMemo(() => {
    const allZones = Object.keys(heatmapData);
    if (selectedZone === 'all') return allZones;
    return allZones.filter(z => z.includes(selectedZone.replace('Zona ', 'Zona ')));
  }, [heatmapData, selectedZone]);

  const getColorIntensity = (value: number) => {
    if (value === 0) return 'bg-gray-100 text-gray-400';
    if (value <= 10) return 'bg-green-200 text-green-800';
    if (value <= 20) return 'bg-yellow-200 text-yellow-800';
    if (value <= 30) return 'bg-orange-300 text-orange-900';
    if (value <= 40) return 'bg-orange-500 text-white';
    if (value <= 50) return 'bg-red-500 text-white';
    return 'bg-red-600 text-white';
  };

  const getDemandLabel = (value: number) => {
    if (value === 0) return 'No Demand';
    if (value <= 10) return 'Low';
    if (value <= 20) return 'Medium';
    if (value <= 30) return 'High';
    if (value <= 40) return 'Very High';
    return 'Peak';
  };

  const getShiftIcon = (hour: number) => {
    if (hour >= 6 && hour < 12) return <Sun className="w-3 h-3 text-orange-500" />;
    if (hour >= 12 && hour < 17) return <Sun className="w-3 h-3 text-yellow-500" />;
    if (hour >= 17 && hour < 21) return <Sun className="w-3 h-3 text-orange-600" />;
    return <Moon className="w-3 h-3 text-indigo-400" />;
  };

  const getShiftLabel = (hour: number) => {
    if (hour >= 7 && hour < 12) return 'Pagi';
    if (hour >= 12 && hour < 17) return 'Siang';
    if (hour >= 17 && hour < 21) return 'Sore';
    return 'Off-peak';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200/50 shadow-sm">
      <CardHeader className="pb-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="w-5 h-5 text-orange-500" />
              Heatmap Demand 24 Jam
            </CardTitle>
            <CardDescription className="text-sm">Intensitas permintaan per zona dan jam</CardDescription>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-gray-500">Demand:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-100 rounded border" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-200 rounded border" />
              <span>1-10</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-200 rounded border" />
              <span>11-20</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-300 rounded border" />
              <span>21-30</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-500 rounded border" />
              <span>31-50</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded border" />
              <span>50+</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {zones.map((zone, zoneIndex) => (
            <div key={zone} className="animate-fade-in" style={{ animationDelay: `${zoneIndex * 50}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-900">{zone}</h4>
                <Badge variant="outline" className="text-xs h-5 px-2 bg-orange-50">
                  {heatmapData[zone]?.[0]?.Karakteristik_Traffic || 'Mixed'}
                </Badge>
              </div>
              
              <div className="overflow-x-auto pb-1">
                <div className="min-w-max">
                  {/* Hour labels */}
                  <div className="flex mb-1">
                    <div className="w-16" />
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <div 
                        key={hour} 
                        className="w-9 text-center text-[10px] text-gray-500 flex flex-col items-center"
                      >
                        {getShiftIcon(hour)}
                        <span>{hour.toString().padStart(2, '0')}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Demand row */}
                  <div className="flex items-center">
                    <div className="w-16 pr-2">
                      <Badge variant="secondary" className="text-[10px] h-5 px-2">Demand</Badge>
                    </div>
                    <div className="flex gap-0.5">
                      {heatmapData[zone]?.map((cell: any) => (
                        <div
                          key={cell.Jam}
                          className={`
                            w-9 h-9 rounded flex items-center justify-center text-[11px] font-medium
                            cursor-pointer heatmap-cell ${getColorIntensity(cell.Demand_Index)}
                          `}
                          onMouseEnter={() => setHoveredCell({ zone, hour: cell.Jam, value: cell.Demand_Index })}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={`${zone} - ${cell.Jam_Label}: Demand ${cell.Demand_Index}`}
                        >
                          {cell.Demand_Index > 0 ? cell.Demand_Index : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Driver row */}
                  <div className="flex items-center mt-1">
                    <div className="w-16 pr-2">
                      <Badge variant="outline" className="text-[10px] h-5 px-2 bg-blue-50">Driver</Badge>
                    </div>
                    <div className="flex gap-0.5">
                      {heatmapData[zone]?.map((cell: any) => (
                        <div
                          key={`driver-${cell.Jam}`}
                          className={`
                            w-9 h-6 rounded flex items-center justify-center text-[10px]
                            ${cell.Recommended_Driver > 5 ? 'bg-blue-500 text-white' : 
                              cell.Recommended_Driver > 3 ? 'bg-blue-400 text-white' : 
                              cell.Recommended_Driver > 1 ? 'bg-blue-300 text-gray-800' : 'bg-blue-100 text-gray-500'}
                          `}
                        >
                          {cell.Recommended_Driver}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Hover tooltip */}
        {hoveredCell && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200 animate-fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900">
                {hoveredCell.zone} - {hoveredCell.hour.toString().padStart(2, '0')}:00
              </span>
              <Badge className={`text-xs h-5 ${
                hoveredCell.value >= 40 ? 'bg-red-500' : 
                hoveredCell.value >= 30 ? 'bg-orange-500' : 
                hoveredCell.value >= 20 ? 'bg-orange-400' : 
                hoveredCell.value >= 10 ? 'bg-yellow-500' : 'bg-green-500'
              } text-white`}>
                {getDemandLabel(hoveredCell.value)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Shift: {getShiftLabel(hoveredCell.hour)} | Demand: {hoveredCell.value} | 
              Driver: {heatmapData[hoveredCell.zone]?.find((h: any) => h.Jam === hoveredCell.hour)?.Recommended_Driver || 0}
            </p>
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-4 border-t border-gray-100">
          {zones.slice(0, 5).map((zone, idx) => {
            const zoneData = heatmapData[zone];
            const peakHour = zoneData?.reduce((max: any, curr: any) => 
              curr.Demand_Index > max.Demand_Index ? curr : max, zoneData[0]
            );
            const totalDemand = zoneData?.reduce((sum: number, curr: any) => sum + curr.Demand_Index, 0);
            
            return (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 truncate">{zone.replace('Zona ', '')}</p>
                <p className="text-lg font-bold text-gray-900">{totalDemand}</p>
                <p className="text-xs text-orange-600">Peak: {peakHour?.Jam_Label || '-'}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
