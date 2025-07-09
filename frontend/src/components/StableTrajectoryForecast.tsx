import React, { useRef, useEffect } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ForecastPosition {
  lat: number;
  lon: number;
  timestamp: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

interface StableTrajectoryForecastProps {
  cycloneName?: string;
  coordinates?: [number, number];
  intensity?: string;
  forecastPath?: ForecastPosition[];
}

const StableTrajectoryForecast = ({ 
  cycloneName = "Tropical System", 
  coordinates = [72.8, 18.5], 
  intensity = "Cyclonic Storm",
  forecastPath = []
}: StableTrajectoryForecastProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const isInitialized = useRef(false);

  console.log("StableTrajectoryForecast component rendered with forecastPath:", forecastPath.length);

  useEffect(() => {
    if (!mapContainer.current || isInitialized.current) return;

    isInitialized.current = true;
    console.log("Initializing StableTrajectoryForecast map");

    // Use dynamic forecast path if provided, otherwise fall back to static demo
    const forecastCoordinates: [number, number][] = forecastPath.length > 0 
      ? forecastPath.map(pos => [pos.lon, pos.lat])
      : [
          [72.8, 18.5], // Starting position
          [73.5, 19.0], // +24 hrs
          [74.0, 19.5], // +48 hrs  
          [74.5, 20.1], // +72 hrs
          [75.0, 20.8], // +96 hrs
          [75.8, 21.8], // +120 hrs
        ];

    const getRiskColor = (riskLevel?: 'low' | 'moderate' | 'high') => {
      switch (riskLevel) {
        case 'high': return '#ef4444';
        case 'moderate': return '#f59e0b';
        case 'low': return '#10b981';
        default: return '#f59e0b';
      }
    };

    const intensityLevels = [
      { level: "Depression", color: "#10b981", radius: 8 },
      { level: "Deep Depression", color: "#f59e0b", radius: 10 },
      { level: "Cyclonic Storm", color: "#ef4444", radius: 12 },
      { level: "Severe Cyclonic Storm", color: "#dc2626", radius: 14 },
      { level: "Dissipating", color: "#6b7280", radius: 8 },
      { level: "Remnant Low", color: "#9ca3af", radius: 6 },
    ];

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
      center: [74, 19.5],
      zoom: 5.5
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      
      console.log("StableTrajectoryForecast map loaded and ready");
      
      // Add trajectory line
      map.current.addSource('trajectory', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: forecastCoordinates
          }
        }
      });

      map.current.addLayer({
        id: 'trajectory-line',
        type: 'line',
        source: 'trajectory',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#f59e0b',
          'line-width': 3,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2]
        }
      });

      // Add forecast points
      forecastCoordinates.forEach((coord, i) => {
        const forecastData = forecastPath.length > 0 ? forecastPath[i] : null;
        const el = document.createElement('div');
        
        // Use dynamic risk color if available, otherwise use intensity levels
        const pointColor = forecastData ? getRiskColor(forecastData.riskLevel) : (intensityLevels[i]?.color || '#f59e0b');
        const pointSize = intensityLevels[i]?.radius * 2 || 16;
        
        el.style.cssText = `
          width: ${pointSize}px;
          height: ${pointSize}px;
          background: ${pointColor};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; text-align: center;">
            <strong>+${i * 24} hrs</strong><br/>
            ${forecastData ? `Risk: ${forecastData.riskLevel?.toUpperCase()}` : intensityLevels[i]?.level || 'Forecast Point'}<br/>
            <small>${coord[1].toFixed(2)}°N, ${coord[0].toFixed(2)}°E</small>
          </div>
        `);

        new maplibregl.Marker(el)
          .setLngLat(coord)
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    return () => {
      console.log("StableTrajectoryForecast cleanup");
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      isInitialized.current = false;
    };
  }, []); // Empty dependency array - initialize once

  return (
    <div className="mt-8 text-white bg-white/10 p-6 rounded shadow-lg border border-white/10">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        🧭 {cycloneName} - Stable Trajectory Forecast (Next 120 hrs)
      </h2>
      <div className="mb-4 text-sm text-gray-300">
        <p>Predicted cyclone path based on atmospheric conditions and model projections</p>
        <div className="mt-2 flex items-center space-x-4">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Live forecast active
          </span>
          <span className="text-gray-400">Updated: {new Date().toLocaleTimeString()}</span>
          <span className="text-blue-400">Current: {intensity}</span>
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden border border-white/20">
        <div 
          ref={mapContainer} 
          style={{ height: "400px", width: "100%" }}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-gray-300">Depression</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-300">Deep Depression</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-300">Cyclonic Storm</span>
        </div>
      </div>
    </div>
  );
};

export default StableTrajectoryForecast;
