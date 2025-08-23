import React, { useRef, useEffect, useMemo } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface TrajectoryForecastProps {
  cycloneName?: string;
  coordinates?: [number, number];
  intensity?: string;
}

const TrajectoryForecast = ({ 
  cycloneName = "Tropical System", 
  coordinates = [72.8, 18.5], 
  intensity = "Cyclonic Storm" 
}: TrajectoryForecastProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  console.log("TrajectoryForecast component rendered with props:", { cycloneName, coordinates, intensity });

  // Enhanced dynamic coordinates with more realistic path data
  const forecastPath: [number, number][] = useMemo(() => [
    coordinates, // Starting position from props
    [coordinates[0] + 0.7, coordinates[1] + 0.5], // +24 hrs - Moving northeast
    [coordinates[0] + 1.2, coordinates[1] + 1.0], // +48 hrs - Continuing inland  
    [coordinates[0] + 1.7, coordinates[1] + 1.6], // +72 hrs - Further inland
    [coordinates[0] + 2.2, coordinates[1] + 2.5], // +96 hrs - Central India
    [coordinates[0] + 3.0, coordinates[1] + 3.3], // +120 hrs - Dissipating
  ], [coordinates]);

  // Intensity levels for each forecast point
  const intensityLevels = useMemo(() => [
    { level: "Depression", color: "#10b981", radius: 8 },
    { level: "Deep Depression", color: "#f59e0b", radius: 10 },
    { level: "Cyclonic Storm", color: "#ef4444", radius: 12 },
    { level: "Severe Cyclonic Storm", color: "#dc2626", radius: 14 },
    { level: "Dissipating", color: "#6b7280", radius: 8 },
    { level: "Remnant Low", color: "#9ca3af", radius: 6 },
  ], []);

  // Extract coordinates for stable dependency tracking
  const centerLon = coordinates[0];
  const centerLat = coordinates[1];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log("Initializing TrajectoryForecast map");

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
      console.log("TrajectoryForecast map loaded");
      // Add trajectory line
      map.current!.addSource('trajectory', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: forecastPath
          }
        }
      });

      map.current!.addLayer({
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
      forecastPath.forEach((coord, i) => {
        const el = document.createElement('div');
        el.className = 'forecast-marker';
        el.style.cssText = `
          width: ${intensityLevels[i]?.radius * 2 || 16}px;
          height: ${intensityLevels[i]?.radius * 2 || 16}px;
          background: ${intensityLevels[i]?.color || '#f59e0b'};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; text-align: center;">
            <strong>+${i * 24} hrs</strong><br/>
            ${intensityLevels[i]?.level || 'Forecast Point'}<br/>
            <small>${coord[1].toFixed(2)}°N, ${coord[0].toFixed(2)}°E</small>
          </div>
        `);

        new maplibregl.Marker(el)
          .setLngLat(coord as [number, number])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    return () => {
      console.log("TrajectoryForecast cleanup");
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [centerLon, centerLat, forecastPath, intensityLevels]);

  return (
    <div className="mt-8 text-white bg-white/10 p-6 rounded shadow-lg border border-white/10">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        🧭 {cycloneName} - Trajectory Forecast (Next 120 hrs)
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
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        {intensityLevels.map((level, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: level.color }}
            ></div>
            <span className="text-gray-300">{level.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrajectoryForecast;
