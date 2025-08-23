import React, { useRef, useEffect } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ForecastPosition {
  lat: number;
  lon: number;
  timestamp: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

interface DynamicTrajectoryForecastProps {
  cycloneName?: string;
  coordinates?: [number, number];
  intensity?: string;
  forecastPath?: ForecastPosition[];
}

const DynamicTrajectoryForecast = ({ 
  cycloneName = "Tropical System", 
  coordinates = [72.8, 18.5], 
  intensity = "Cyclonic Storm",
  forecastPath = []
}: DynamicTrajectoryForecastProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  console.log("DynamicTrajectoryForecast component rendered with forecastPath:", forecastPath.length);

  const getRiskColor = (riskLevel?: 'low' | 'moderate' | 'high') => {
    switch (riskLevel) {
      case 'high': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#f59e0b';
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log("Initializing DynamicTrajectoryForecast map");

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

    return () => {
      console.log("DynamicTrajectoryForecast cleanup");
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map data when forecast changes
  useEffect(() => {
    if (!map.current) return;
    
    console.log("Updating DynamicTrajectoryForecast with new forecast data");
    
    const handleForecastUpdate = () => {
      if (!map.current) return;
      
      // Clear existing data
      if (map.current.getSource('trajectory')) {
        map.current.removeLayer('trajectory-line');
        map.current.removeSource('trajectory');
      }
      
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.forecast-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Use dynamic forecast path if provided, otherwise fall back to static demo
      const forecastCoordinates: [number, number][] = forecastPath.length > 0 
        ? forecastPath.map(pos => [pos.lon, pos.lat])
        : [
            [coordinates[0], coordinates[1]], // Starting position
            [coordinates[0] + 0.7, coordinates[1] + 0.5], // +24 hrs
            [coordinates[0] + 1.2, coordinates[1] + 1.0], // +48 hrs  
            [coordinates[0] + 1.7, coordinates[1] + 1.6], // +72 hrs
            [coordinates[0] + 2.2, coordinates[1] + 2.3], // +96 hrs
            [coordinates[0] + 3.0, coordinates[1] + 3.3], // +120 hrs
          ];

      const intensityLevels = [
        { level: "Current Position", color: "#ef4444", radius: 10 },
        { level: "Deep Depression", color: "#f59e0b", radius: 10 },
        { level: "Cyclonic Storm", color: "#ef4444", radius: 12 },
        { level: "Severe Cyclonic Storm", color: "#dc2626", radius: 14 },
        { level: "Dissipating", color: "#6b7280", radius: 8 },
        { level: "Remnant Low", color: "#9ca3af", radius: 6 },
      ];
      
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
        el.className = 'forecast-marker';
        
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

        const hoursAhead = i * 24;
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; text-align: center;">
            <strong>${hoursAhead === 0 ? 'Current' : `+${hoursAhead} hrs`}</strong><br/>
            ${forecastData ? `Risk: ${forecastData.riskLevel?.toUpperCase()}` : intensityLevels[i]?.level || 'Forecast Point'}<br/>
            <small>${coord[1].toFixed(2)}°N, ${coord[0].toFixed(2)}°E</small><br/>
            ${forecastData ? `<small>${new Date(forecastData.timestamp).toLocaleString()}</small>` : ''}
          </div>
        `);

        new maplibregl.Marker(el)
          .setLngLat(coord)
          .setPopup(popup)
          .addTo(map.current!);
      });
      
      // Fit map to show all forecast positions
      if (forecastCoordinates.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        forecastCoordinates.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 50 });
      }
    };
    
    if (map.current.loaded()) {
      handleForecastUpdate();
    } else {
      map.current.on('load', handleForecastUpdate);
    }
    
  }, [forecastPath, coordinates, cycloneName]);

  return (
    <div className="mt-8 text-white bg-white/10 p-6 rounded shadow-lg border border-white/10">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        🧭 {cycloneName} - Dynamic Trajectory Forecast (Next 120 hrs)
      </h2>
      <div className="mb-4 text-sm text-gray-300">
        <p>Predicted cyclone path based on atmospheric conditions and model projections</p>
        <div className="mt-2 flex items-center space-x-4">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Dynamic forecast active
          </span>
          <span className="text-gray-400">Updated: {new Date().toLocaleTimeString()}</span>
          <span className="text-blue-400">Current: {intensity}</span>
          <span className="text-purple-400">Path Points: {forecastPath.length || 6}</span>
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
          <span className="text-gray-300">Low Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-300">Moderate Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-300">High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicTrajectoryForecast;
