import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'land' | 'infra' | 'business' | 'driver';

interface FilterControlsProps {
    intensity: number;
    setIntensity: (value: number) => void;
    radius: number;
    setRadius: (value: number) => void;

    // Filters
    mode: ViewMode;
    showMarkers: boolean;
    setShowMarkers: (value: boolean) => void;

    // Land Filters
    selectedTypes: string[];
    toggleType: (type: string) => void;

    // Infra Filters
    selectedInfra: string[];
    toggleInfra: (type: string) => void;

    className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    intensity,
    setIntensity,
    radius,
    setRadius,
    mode,
    showMarkers,
    setShowMarkers,
    selectedTypes,
    toggleType,
    selectedInfra,
    toggleInfra,
    className
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm flex items-center text-gray-700">
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-orange-500" />
                    Pengaturan Peta
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
            </div>

            {!isCollapsed && (
                <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">
                    {/* Common Sliders */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {mode === 'driver' ? 'Jangkauan Area' : 'Radius Heatmap'}
                            </Label>
                            <span className="text-xs font-mono text-orange-600 font-bold">{radius}px</span>
                        </div>
                        <Slider
                            value={[radius]}
                            onValueChange={(val) => setRadius(val[0])}
                            min={10}
                            max={60}
                            step={1}
                            className="py-1 cursor-pointer"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Intensitas Warna</Label>
                            <span className="text-xs font-mono text-orange-600 font-bold">{intensity}x</span>
                        </div>
                        <Slider
                            value={[intensity]}
                            onValueChange={(val) => setIntensity(val[0])}
                            min={0.1}
                            max={5}
                            step={0.1}
                            className="py-1 cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <Label htmlFor="show-markers" className="text-sm font-medium cursor-pointer">Tampilkan Marker</Label>
                        <Switch
                            id="show-markers"
                            checked={showMarkers}
                            onCheckedChange={setShowMarkers}
                            className={`data-[state=checked]:${mode === 'driver' ? 'bg-green-600' : 'bg-orange-500'}`}
                        />
                    </div>

                    {/* Mode Specific Filters */}
                    {mode === 'land' && (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Tipe Lahan</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Residential', 'Commercial', 'Industrial', 'Mixed Use'].map((type) => (
                                    <div key={type} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer" onClick={() => toggleType(type)}>
                                        <Checkbox
                                            id={`type-${type}`}
                                            checked={selectedTypes.includes(type)}
                                            onCheckedChange={() => toggleType(type)}
                                            className="data-[state=checked]:bg-orange-500"
                                        />
                                        <Label htmlFor={`type-${type}`} className="text-xs font-normal cursor-pointer select-none">
                                            {type}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'infra' && (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Fasilitas Publik</Label>
                            <div className="space-y-1">
                                {['Office', 'School', 'Hospital', 'Mall'].map((type) => (
                                    <div key={type} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer" onClick={() => toggleInfra(type)}>
                                        <Checkbox
                                            id={`infra-${type}`}
                                            checked={selectedInfra.includes(type)}
                                            onCheckedChange={() => toggleInfra(type)}
                                            className="data-[state=checked]:bg-blue-500"
                                        />
                                        <Label htmlFor={`infra-${type}`} className="text-sm cursor-pointer select-none">{type}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterControls;
