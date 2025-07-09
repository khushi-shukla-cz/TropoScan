import React, { useRef, useEffect } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StormPosition {
  lat: number;
  lon: number;
  timestamp: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

interface DynamicPathPredictorProps {
  stormName?: string;
  positions?: StormPosition[];
}

const DynamicPathPredictor = ({ 
  stormName = "Tropical System", 
  positions = []
}: DynamicPathPredictorProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  
  // Simple demo data if no positions provided
  const demoPositions = [
    { lat: 18.2, lon: 72.8, timestamp: '2023-06-10T00:00:00Z', riskLevel: 'low' as const },
    { lat: 18.5, lon: 73.2, timestamp: '2023-06-10T06:00:00Z', riskLevel: 'low' as const },
    { lat: 18.9, lon: 73.7, timestamp: '2023-06-10T12:00:00Z', riskLevel: 'moderate' as const },
    { lat: 19.4, lon: 74.3, timestamp: '2023-06-10T18:00:00Z', riskLevel: 'moderate' as const },
    { lat: 20.1, lon: 75.0, timestamp: '2023-06-11T00:00:00Z', riskLevel: 'high' as const },
  ];
  
  const stormPositions = positions.length > 0 ? positions : demoPositions;
  
  const getRiskColor = (riskLevel?: 'low' | 'moderate' | 'high') => {
    switch (riskLevel) {
      case 'high': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    console.log("Initializing DynamicPathPredictor map");
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }]
      },
      center: [73.5, 19.0],
      zoom: 6
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    return () => {
      console.log("DynamicPathPredictor cleanup");
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map data when positions change
  useEffect(() => {
    if (!map.current) return;
    
    console.log("Updating DynamicPathPredictor with new positions:", stormPositions.length);
    
    const handleMapUpdate = () => {
      if (!map.current) return;
      
      // Clear existing data
      if (map.current.getSource('storm-path')) {
        map.current.removeLayer('storm-path-line');
        map.current.removeSource('storm-path');
      }
      
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.storm-marker');
      existingMarkers.forEach(marker => marker.remove());
      
      // Add updated storm path
      const coordinates = stormPositions.map(pos => [pos.lon, pos.lat]);
      
      map.current.addSource('storm-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });
      
      map.current.addLayer({
        id: 'storm-path-line',
        type: 'line',
        source: 'storm-path',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
      
      // Add markers for each position
      stormPositions.forEach((pos, i) => {
        const el = document.createElement('div');
        el.className = 'storm-marker';
        el.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${getRiskColor(pos.riskLevel)};
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="padding: 8px; text-align: center;">
            <strong>Position ${i + 1}</strong><br/>
            ${pos.lat.toFixed(2)}°N, ${pos.lon.toFixed(2)}°E<br/>
            <span style="color:${getRiskColor(pos.riskLevel)}">${(pos.riskLevel || 'unknown').toUpperCase()} RISK</span><br/>
            <small>${new Date(pos.timestamp).toLocaleString()}</small>
          </div>
        `);

        new maplibregl.Marker(el)
          .setLngLat([pos.lon, pos.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });
      
      // Add cyclone marker at current position
      const cycloneEl = document.createElement('div');
      cycloneEl.className = 'storm-marker';
      cycloneEl.innerHTML = '🌀';
      cycloneEl.style.fontSize = '24px';
      cycloneEl.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))';
      
      const currentPos = stormPositions[stormPositions.length - 1];
      new maplibregl.Marker(cycloneEl)
        .setLngLat([currentPos.lon, currentPos.lat])
        .addTo(map.current!);
      
      // Fit map to show all positions
      if (coordinates.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord as [number, number]));
        map.current.fitBounds(bounds, { padding: 50 });
      }
    };
    
    if (map.current.loaded()) {
      handleMapUpdate();
    } else {
      map.current.on('load', handleMapUpdate);
    }
    
  }, [stormPositions, stormName]);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <div className="mr-2">🌪️</div>
          Dynamic Storm Path Tracking - {stormName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg overflow-hidden border border-white/20">
          <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <Badge variant="outline" className="px-2 py-1 border-blue-400/30 text-blue-300">
            {stormPositions.length} tracked positions
          </Badge>
          <Badge variant="outline" className="px-2 py-1 border-green-400/30 text-green-300">
            Real-time tracking active
          </Badge>
          <Badge variant="outline" className="px-2 py-1 border-yellow-400/30 text-yellow-300">
            Dynamic prediction
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicPathPredictor;
