import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import HeatmapLayer from '@/components/Map/HeatmapLayer';
import FilterControls from '@/components/Map/FilterControls';
import { Button } from '@/components/ui/button';
import { Sparkles, X, School, Hospital, Briefcase, ShoppingBag, Bike, Clock, TrendingUp, Navigation, Store, Factory, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOverpassData } from '@/hooks/useOverpassData';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- CONSTANTS & TYPES ---

type ViewMode = 'land' | 'infra' | 'business' | 'driver';

interface BusinessNode {
    id: number;
    lat: number;
    lng: number;
    name: string;
    type: 'CBD' | 'Mall' | 'Transport' | 'Office' | 'Market' | 'Residential' | 'Healthcare' | 'School';
    traffic: number;
    score: number;
    peakHours: string;
    driverPotential: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
}

const CENTER: [number, number] = [-6.1880, 106.7380];

// 1. CURATED BUSINESS DATA
const REAL_BUSINESS_DATA: BusinessNode[] = [
    // --- UTAMA (Malls & CBD) ---
    { id: 1, lat: -6.1883, lng: 106.7334, name: 'Puri Indah CBD (Pusat)', type: 'CBD', traffic: 18000, score: 96, peakHours: '08:00 - 19:00', driverPotential: 'Sangat Tinggi' },
    { id: 2, lat: -6.1866, lng: 106.7368, name: 'Puri Indah Mall (Lobby Utama)', type: 'Mall', traffic: 15000, score: 82, peakHours: '11:00 - 21:00', driverPotential: 'Sangat Tinggi' },
    { id: 3, lat: -6.1800, lng: 106.7330, name: 'Lippo Mall Puri (Parkir Motor)', type: 'Mall', traffic: 12000, score: 78, peakHours: '11:00 - 21:00', driverPotential: 'Tinggi' },
    { id: 4, lat: -6.1805, lng: 106.7345, name: 'Lippo Mall Puri (Lobby Grab)', type: 'Mall', traffic: 10000, score: 75, peakHours: '10:00 - 22:00', driverPotential: 'Sangat Tinggi' },
    { id: 5, lat: -6.1875, lng: 106.7365, name: 'Hypermart Puri Indah', type: 'Market', traffic: 8000, score: 70, peakHours: '09:00 - 20:00', driverPotential: 'Sedang' },

    // --- TRANSPORT & TRANSIT ---
    { id: 6, lat: -6.1550, lng: 106.7300, name: 'Stasiun Taman Kota', type: 'Transport', traffic: 12000, score: 70, peakHours: '06:00 - 09:00 & 16:00 - 20:00', driverPotential: 'Sangat Tinggi' },
    { id: 7, lat: -6.1650, lng: 106.7250, name: 'Stasiun Rawa Buaya', type: 'Transport', traffic: 9000, score: 65, peakHours: '06:00 - 09:00 & 16:00 - 20:00', driverPotential: 'Tinggi' },
    { id: 8, lat: -6.1580, lng: 106.7350, name: 'Halte TJ Taman Kota', type: 'Transport', traffic: 3500, score: 46, peakHours: '06:00 - 20:00', driverPotential: 'Sedang' },

    // --- OFFICES & GOVERNMENT ---
    { id: 9, lat: -6.1850, lng: 106.7300, name: 'Kantor Walikota Jakbar', type: 'Office', traffic: 7000, score: 85, peakHours: '07:00 - 16:00', driverPotential: 'Sangat Tinggi' },
    { id: 10, lat: -6.1870, lng: 106.7320, name: 'Tokopedia Care Tower', type: 'Office', traffic: 6000, score: 67, peakHours: '08:00 - 18:00', driverPotential: 'Tinggi' },
    { id: 11, lat: -6.1910, lng: 106.7400, name: 'Bluegreen Office', type: 'Office', traffic: 5500, score: 64, peakHours: '08:00 - 17:00', driverPotential: 'Sedang' },
    { id: 12, lat: -6.1820, lng: 106.7420, name: 'Ciputra International', type: 'Office', traffic: 5000, score: 63, peakHours: '08:00 - 18:00', driverPotential: 'Tinggi' },
    { id: 13, lat: -6.1950, lng: 106.7550, name: 'MNC Studios', type: 'Office', traffic: 4500, score: 62, peakHours: '09:00 - 19:00', driverPotential: 'Sedang' },
    { id: 14, lat: -6.1890, lng: 106.7380, name: 'PX Pavilion', type: 'Office', traffic: 3000, score: 55, peakHours: '10:00 - 20:00', driverPotential: 'Sedang' },

    // --- HEALTHCARE ---
    { id: 15, lat: -6.1895, lng: 106.7360, name: 'RS Pondok Indah Puri', type: 'Healthcare', traffic: 4000, score: 44, peakHours: '09:00 - 15:00', driverPotential: 'Sedang' },
    { id: 16, lat: -6.1920, lng: 106.7580, name: 'Siloam Hospitals Kebon Jeruk', type: 'Healthcare', traffic: 6000, score: 60, peakHours: '08:00 - 17:00', driverPotential: 'Tinggi' },

    // --- RESIDENTIAL (Apartments & Housing) ---
    { id: 17, lat: -6.1840, lng: 106.7550, name: 'Apartemen St. Moritz', type: 'Residential', traffic: 3000, score: 32, peakHours: '06:00 - 09:00', driverPotential: 'Tinggi' },
    { id: 18, lat: -6.1980, lng: 106.7450, name: 'Puri Park View Apt', type: 'Residential', traffic: 5500, score: 58, peakHours: '06:00 - 10:00', driverPotential: 'Sangat Tinggi' },
    { id: 19, lat: -6.1750, lng: 106.7550, name: 'Metro Park Residence', type: 'Residential', traffic: 4000, score: 52, peakHours: '07:00 - 09:00', driverPotential: 'Tinggi' },
    { id: 20, lat: -6.1880, lng: 106.7250, name: 'Puri Garden Apartment', type: 'Residential', traffic: 2500, score: 40, peakHours: '06:00 - 09:00', driverPotential: 'Sedang' },
    { id: 21, lat: -6.1680, lng: 106.7400, name: 'Green Lake City (Gerbang)', type: 'Residential', traffic: 8000, score: 75, peakHours: '06:00 - 09:00 & 17:00 - 20:00', driverPotential: 'Sangat Tinggi' },

    // --- EDUCATION ---
    { id: 22, lat: -6.1830, lng: 106.7500, name: 'IPEKA Puri', type: 'School', traffic: 3000, score: 45, peakHours: '13:00 - 15:00', driverPotential: 'Tinggi' },
    { id: 23, lat: -6.1860, lng: 106.7450, name: 'Notre Dame School', type: 'School', traffic: 2500, score: 42, peakHours: '13:00 - 15:00', driverPotential: 'Sedang' },
    { id: 24, lat: -6.1950, lng: 106.7350, name: 'Springfield School', type: 'School', traffic: 2000, score: 40, peakHours: '14:00 - 16:00', driverPotential: 'Sedang' },
    { id: 25, lat: -6.2050, lng: 106.7380, name: 'Universitas Mercu Buana', type: 'School', traffic: 15000, score: 78, peakHours: '08:00 - 18:00', driverPotential: 'Sangat Tinggi' },

    // --- CULINARY & MARKETS ---
    { id: 26, lat: -6.1650, lng: 106.7450, name: 'Pasar Taman Kota', type: 'Market', traffic: 5000, score: 50, peakHours: '05:00 - 11:00', driverPotential: 'Sedang' },
    { id: 27, lat: -6.1900, lng: 106.7500, name: 'Kuliner Pesanggrahan', type: 'Market', traffic: 7000, score: 88, peakHours: '18:00 - 23:00', driverPotential: 'Sangat Tinggi' },
    { id: 28, lat: -6.1850, lng: 106.7600, name: 'Ranch Market Pesanggrahan', type: 'Market', traffic: 3000, score: 65, peakHours: '09:00 - 20:00', driverPotential: 'Tinggi' },
    { id: 29, lat: -6.2000, lng: 106.7450, name: 'McDonalds Meruya', type: 'Market', traffic: 4500, score: 80, peakHours: '24 Jam', driverPotential: 'Sangat Tinggi' },
    { id: 30, lat: -6.1950, lng: 106.7250, name: 'Puri Indah Market', type: 'Market', traffic: 4000, score: 55, peakHours: '06:00 - 12:00', driverPotential: 'Sedang' },

    // --- OTHERS ---
    { id: 31, lat: -6.2080, lng: 106.7500, name: 'Hutan Kota Srengseng', type: 'Transport', traffic: 2000, score: 35, peakHours: '06:00 - 10:00 (Weekend)', driverPotential: 'Rendah' },
    { id: 32, lat: -6.1750, lng: 106.7300, name: 'SPBU Shell Puri 1', type: 'Transport', traffic: 5000, score: 45, peakHours: '16:00 - 19:00', driverPotential: 'Sedang' },
];

// 2. MOCK DATA GENERATOR
const generatePoints = (count: number, center: [number, number]) => {
    const points = [];
    const types = ['Residential', 'Commercial', 'Industrial', 'Mixed Use'];
    for (let i = 0; i < count; i++) {
        const lat = center[0] + (Math.random() - 0.5) * 0.05;
        const lng = center[1] + (Math.random() - 0.5) * 0.05;
        const type = types[Math.floor(Math.random() * types.length)];
        const rate = 15000000 + Math.floor(Math.random() * 35000000);
        points.push({
            id: i,
            lat,
            lng,
            intensity: Math.random(),
            type,
            rate,
            name: `Lahan ${type}`,
            description: `Lokasi strategis di area Kembangan.`,
        });
    }
    return points;
};
const INITIAL_LAND_POINTS = generatePoints(120, CENTER);

// --- UTILS ---

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const createCustomIcon = (type: string, mode: ViewMode) => {
    if (mode === 'driver') {
        return divIcon({
            className: 'custom-leaflet-icon',
            html: `<div class="bg-green-600 w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
        });
    }

    let colorClass = 'bg-gray-500';
    let iconHtml = '';

    if (mode === 'land') {
        if (type === 'Residential') colorClass = 'bg-green-500';
        if (type === 'Commercial') colorClass = 'bg-blue-500';
        if (type === 'Industrial') colorClass = 'bg-purple-500';
        if (type === 'Mixed Use') colorClass = 'bg-orange-500';
        iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/></svg>';
    } else if (mode === 'infra' || mode === 'business') {
        if (type === 'CBD' || type === 'Office') { colorClass = 'bg-slate-600'; iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="4"/><path d="M6 22V11a2 2 0 0 1 2-2h8"/><path d="M2.5 22h19"/></svg>'; }
        else if (type === 'Mall' || type === 'Market') { colorClass = 'bg-pink-500'; iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>'; }
        else if (type === 'Transport') { colorClass = 'bg-blue-600'; iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="13" x="4" y="5" rx="2"/></svg>'; }
        else if (type === 'School') { colorClass = 'bg-yellow-500'; iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4"/></svg>'; }
        else if (type === 'Hospital' || type === 'Healthcare') { colorClass = 'bg-red-500'; iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/></svg>'; }
        else { colorClass = 'bg-orange-500'; iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>'; }
    }

    return divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="${colorClass} w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200">${iconHtml}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const HeatmapSection = () => {
    const [mode, setMode] = useState<ViewMode>('land');
    const [intensity, setIntensity] = useState(1);
    const [radius, setRadius] = useState(30);
    const [showMarkers, setShowMarkers] = useState(true);

    // Filtering States
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['Residential', 'Commercial', 'Industrial', 'Mixed Use']);
    const [selectedInfra, setSelectedInfra] = useState<string[]>(['Office', 'School', 'Hospital', 'Mall']);

    // UI State
    const [activeTab, setActiveTab] = useState("insights");

    // Data fetching logic
    const { data: infraData, loading: infraLoading } = useOverpassData();

    // Handlers
    const toggleType = (type: string) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const toggleInfra = (type: string) => {
        setSelectedInfra(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    // Filter Data
    const filteredLandPoints = useMemo(() => {
        return INITIAL_LAND_POINTS.filter(p => selectedTypes.includes(p.type));
    }, [selectedTypes]);

    const filteredInfraPoints = useMemo(() => {
        return infraData.filter(p => selectedInfra.includes(p.type));
    }, [infraData, selectedInfra]);

    // Heatmap Points Logic
    const heatmapPoints = useMemo(() => {
        if (mode === 'land') {
            return filteredLandPoints.map(p => [p.lat, p.lng, p.intensity * intensity] as [number, number, number]);
        }
        else if (mode === 'infra') {
            return filteredInfraPoints.map(p => [p.lat, p.lng, 1.0] as [number, number, number]);
        }
        else if (mode === 'driver') {
            return REAL_BUSINESS_DATA.map(p => {
                const w = p.driverPotential === 'Sangat Tinggi' ? 2 : p.driverPotential === 'Tinggi' ? 1.5 : 0.5;
                return [p.lat, p.lng, w * intensity] as [number, number, number];
            });
        }
        else { // business
            return REAL_BUSINESS_DATA.map(p => [p.lat, p.lng, (p.traffic / 20000) * intensity] as [number, number, number]);
        }
    }, [mode, intensity, filteredLandPoints, filteredInfraPoints]); // removed extra filteredLandPoints

    // Gradient Config
    const gradient = useMemo(() => {
        if (mode === 'land') return { 0.4: 'blue', 0.65: 'lime', 1: 'red' } as Record<number, string>;
        if (mode === 'infra') return { 0.2: 'blue', 0.6: 'cyan', 1: 'lime' } as Record<number, string>;
        if (mode === 'driver') return { 0.3: '#10b981', 0.6: '#eab308', 1: '#ef4444' } as Record<number, string>;
        return { 0.4: 'orange', 1: 'red' } as Record<number, string>;
    }, [mode]);

    return (
        <section className="relative w-full h-full min-h-[600px] overflow-hidden rounded-xl border border-gray-200 shadow-inner bg-gray-50 flex flex-col md:flex-row">

            {/* MAP CONTAINER (LEFT) */}
            <div className="relative flex-1 h-[500px] md:h-auto">

                {/* TOP CONTROLS */}
                <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2 justify-center md:justify-start pointer-events-auto">
                    <div className="bg-white/90 backdrop-blur rounded-lg p-1 shadow-lg border border-gray-200 flex overflow-x-auto max-w-full">
                        {[
                            { id: 'land', label: '💰 Nilai Lahan', color: 'bg-green-100 text-green-700' },
                            { id: 'infra', label: '🏢 Infrastruktur', color: 'bg-blue-100 text-blue-700' },
                            { id: 'business', label: '📊 Bisnis Area', color: 'bg-orange-100 text-orange-700' },
                            { id: 'driver', label: '🛵 Mitra Driver', color: 'bg-emerald-100 text-emerald-700' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id as ViewMode)}
                                className={cn(
                                    "px-3 py-2 text-xs font-bold rounded-md whitespace-nowrap transition-all",
                                    mode === m.id ? `${m.color} shadow-sm scale-105` : "text-gray-500 hover:bg-gray-100"
                                )}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <MapContainer center={CENTER} zoom={14} style={{ height: '100%', width: '100%' }} className="z-0">
                    <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                    <HeatmapLayer
                        points={heatmapPoints}
                        options={{ radius: mode === 'driver' ? radius + 10 : radius, blur: 25, maxZoom: 17, gradient }}
                    />

                    {/* RENDERING MARKERS */}
                    {showMarkers && (
                        <>
                            {mode === 'land' && filteredLandPoints.map(point => (
                                <Marker key={point.id} position={[point.lat, point.lng]} icon={createCustomIcon(point.type, 'land')}>
                                    <Popup className="min-w-[200px]">
                                        <div className="font-bold">{point.name}</div>
                                        <div className="text-xs text-gray-500">{formatCurrency(point.rate)}/m²</div>
                                    </Popup>
                                </Marker>
                            ))}

                            {mode === 'infra' && filteredInfraPoints.map(point => (
                                <Marker key={point.id} position={[point.lat, point.lng]} icon={createCustomIcon(point.type, 'infra')}>
                                    <Popup>
                                        <div className="font-bold">{point.name}</div>
                                        <Badge variant="secondary" className="mt-1">{point.type}</Badge>
                                    </Popup>
                                </Marker>
                            ))}

                            {(mode === 'business' || mode === 'driver') && REAL_BUSINESS_DATA.map(point => (
                                <Marker key={point.id} position={[point.lat, point.lng]} icon={createCustomIcon(point.type, mode)}>
                                    <Popup className="min-w-[300px] p-0 border-0 rounded-xl overflow-hidden">
                                        <div className={cn("p-3 text-white", mode === 'driver' ? "bg-emerald-600" : "bg-orange-500")}>
                                            <div className="font-bold text-lg">{point.name}</div>
                                            <div className="text-xs opacity-90">{point.type} • {point.traffic.toLocaleString()} visitors</div>
                                        </div>
                                        <div className="p-3 bg-white space-y-2">
                                            {mode === 'driver' ? (
                                                <>
                                                    <div className="flex justify-between items-center bg-emerald-50 p-2 rounded text-emerald-800 text-sm font-bold">
                                                        <span>Potensi Driver</span>
                                                        <span>{point.driverPotential}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <div>⏰ <strong>Jam Ramai:</strong> {point.peakHours}</div>
                                                        <div className="mt-1">📍 <strong>Titik Ngetem:</strong> Lobby / Parkiran Utama</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-center bg-orange-50 p-2 rounded text-orange-800 text-sm font-bold">
                                                        <span>Score Lokasi</span>
                                                        <span>{point.score}/100</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        Lokasi ini sangat strategis untuk ekspansi bisnis F&B dan Retail.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </>
                    )}

                    {/* Driver Green Zones */}
                    {mode === 'driver' && REAL_BUSINESS_DATA.filter(p => p.driverPotential === 'Sangat Tinggi').map(p => (
                        <Circle key={`z-${p.id}`} center={[p.lat, p.lng]} radius={250} pathOptions={{ color: '#10b981', fillOpacity: 0.1, dashArray: '5,5' }} />
                    ))}

                </MapContainer>
            </div>

            {/* SIDE PANEL (RIGHT) */}
            <div className="w-full md:w-[350px] bg-white border-l border-gray-200 flex flex-col h-[400px] md:h-auto overflow-hidden">
                {/* HEADER */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        {mode === 'land' && '💰 Nilai Lahan'}
                        {mode === 'infra' && '🏢 Infrastruktur'}
                        {mode === 'business' && '📊 Analisis Bisnis'}
                        {mode === 'driver' && '🛵 Mitra Driver'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {mode === 'land' && 'Estimasi harga tanah dan potensi investasi properti.'}
                        {mode === 'infra' && 'Sebaran fasilitas umum (Sekolah, RS, Kantor).'}
                        {mode === 'business' && 'Data traffic dan skor lokasi untuk ekspansi outlet.'}
                        {mode === 'driver' && 'Titik mangkal strategis dan potensi orderan.'}
                    </p>
                </div>

                {/* TABS: INSIGHTS & FILTERS */}
                <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="insights" className="w-full">
                        <div className="px-4 pt-2">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="insights">✨ Insights</TabsTrigger>
                                <TabsTrigger value="filters">⚙️ Settings</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-4">
                            <TabsContent value="insights" className="space-y-4 mt-0">
                                {/* DYNAMIC INSIGHTS CONTENT */}
                                {mode === 'driver' && (
                                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                                        <h3 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-1"><Bike className="w-4 h-4" /> Strategi Gacor</h3>
                                        <ul className="text-xs text-emerald-700 list-disc pl-4 space-y-1">
                                            <li>Standby di <strong>Puri Indah Mall</strong> jam 11:00.</li>
                                            <li>Geser ke <strong>Stasiun Taman Kota</strong> saat jam pulang kantor.</li>
                                        </ul>
                                    </div>
                                )}

                                {(mode === 'land' || mode === 'infra') && (
                                    <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                                        <strong>Statistik:</strong> Menampilkan {mode === 'land' ? filteredLandPoints.length : filteredInfraPoints.length} titik lokasi di area ini.
                                    </div>
                                )}

                                {(mode === 'business' || mode === 'driver') && (
                                    <div className="space-y-2">
                                        {REAL_BUSINESS_DATA.slice(0, 4).map((d, i) => (
                                            <div key={d.id} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <div className="font-bold text-gray-400 text-xs">#{i + 1}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm truncate">{d.name}</div>
                                                    <div className="text-xs text-gray-400">{d.traffic / 1000}k visitors</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="filters" className="mt-0">
                                <FilterControls
                                    intensity={intensity}
                                    setIntensity={setIntensity}
                                    radius={radius}
                                    setRadius={setRadius}
                                    mode={mode}
                                    showMarkers={showMarkers}
                                    setShowMarkers={setShowMarkers}
                                    selectedTypes={selectedTypes}
                                    toggleType={toggleType}
                                    selectedInfra={selectedInfra}
                                    toggleInfra={toggleInfra}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </section>
    );
};

export default HeatmapSection;
