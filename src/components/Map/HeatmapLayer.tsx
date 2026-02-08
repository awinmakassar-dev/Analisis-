import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
    points: [number, number, number][]; // lat, lng, intensity
    options?: L.HeatMapOptions;
}

const HeatmapLayer = ({ points, options }: HeatmapLayerProps) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        const heat = L.heatLayer(points, options || {});
        heat.addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points, options, map]);

    return null;
};

export default HeatmapLayer;
