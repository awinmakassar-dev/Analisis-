import { useState, useEffect } from 'react';

export interface OSMNode {
    id: number;
    lat: number;
    lng: number;
    name: string;
    type: 'School' | 'Hospital' | 'Office' | 'Mall';
    tags: any;
}

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Kembangan Bounding Box (approx)
const BBOX = '-6.22,106.70,-6.16,106.78';

export const useOverpassData = () => {
    const [data, setData] = useState<OSMNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const query = `
          [out:json][timeout:25];
          (
            node["amenity"="school"](${BBOX});
            way["amenity"="school"](${BBOX});
            node["amenity"="hospital"](${BBOX});
            way["amenity"="hospital"](${BBOX});
            node["office"](${BBOX});
            way["office"](${BBOX});
            node["shop"="mall"](${BBOX});
           way["shop"="mall"](${BBOX});
          );
          out center;
        `;

                const response = await fetch(OVERPASS_API_URL, {
                    method: 'POST',
                    body: query,
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const jsonData = await response.json();

                const parsedData: OSMNode[] = jsonData.elements.map((el: any) => {
                    const lat = el.lat || el.center?.lat;
                    const lng = el.lon || el.center?.lon;
                    const tags = el.tags || {};

                    let type: OSMNode['type'] = 'Office';
                    if (tags.amenity === 'school') type = 'School';
                    if (tags.amenity === 'hospital') type = 'Hospital';
                    if (tags.shop === 'mall') type = 'Mall';

                    return {
                        id: el.id,
                        lat,
                        lng,
                        name: tags.name || `${type} (Unnamed)`,
                        type,
                        tags
                    };
                }).filter((el: OSMNode) => el.lat && el.lng); // Ensure valid dimensions

                setData(parsedData);
            } catch (err) {
                console.error("Failed to fetch OSM data", err);
                setError(err instanceof Error ? err.message : 'Unknown error');

                // Fallback mock data if API fails (common with Overpass rate limits)
                // ... (can add fallback logic here if needed)
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
