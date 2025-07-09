import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CycloneMapLibreProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  locations?: Array<{
    lat: number;
    lng: number;
    name: string;
    riskScore: number;
    temperature: number;
    coverage: number;
    confidence: number;
    riskLevel: "low" | "moderate" | "high";
    lastUpdated: string;
  }>;
  onLocationSelect?: (location: any) => void;
  selectedLocation?: any;
  enableHeatmap?: boolean;
  interactive?: boolean;
}

const CycloneMapLibre: React.FC<CycloneMapLibreProps> = ({
  className = '',
  center = [77.0, 20.0], // [lng, lat] for MapLibre
  zoom = 5,
  locations = [],
  onLocationSelect,
  selectedLocation,
  enableHeatmap = true,
  interactive = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'street' | 'satellite' | 'terrain'>('street');
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Optimized map styles with better performance
  const getMapStyle = useCallback((styleType: 'street' | 'satellite' | 'terrain') => {
    const styles = {
      street: {
        version: 8 as const,
        sources: {
          'osm': {
            type: 'raster' as const,
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap'
          }
        },
        layers: [{ id: 'osm-layer', type: 'raster' as const, source: 'osm' }]
      },
      satellite: {
        version: 8 as const,
        sources: {
          'satellite': {
            type: 'raster' as const,
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: '© Esri'
          }
        },
        layers: [{ id: 'satellite-layer', type: 'raster' as const, source: 'satellite' }]
      },
      terrain: {
        version: 8 as const,
        sources: {
          'terrain': {
            type: 'raster' as const,
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: '© Esri'
          }
        },
        layers: [{ id: 'terrain-layer', type: 'raster' as const, source: 'terrain' }]
      }
    };
    return styles[styleType];
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: getMapStyle(currentStyle),
        center: center,
        zoom: zoom,
        maxZoom: 18,
        minZoom: 2,
        interactive: interactive
      });

      if (interactive) {
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
      }

      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        setIsLoaded(true);
      });

      map.current.on('error', (e) => {
        console.warn('MapLibre GL warning:', e);
      });

    } catch (error) {
      console.error('MapLibre GL initialization failed:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [interactive]);

  // Add heatmap and markers
  useEffect(() => {
    if (!map.current || !isLoaded || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (enableHeatmap) {
      addHeatmapVisualization();
    }
    
    addLocationMarkers();
  }, [locations, isLoaded, enableHeatmap]);

  const addHeatmapVisualization = () => {
    if (!map.current) return;

    const heatmapData = {
      type: 'FeatureCollection' as const,
      features: locations.map(loc => ({
        type: 'Feature' as const,
        properties: { risk: loc.riskScore },
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.lng, loc.lat]
        }
      }))
    };

    // Remove existing heatmap
    if (map.current.getLayer('heatmap-layer')) {
      map.current.removeLayer('heatmap-layer');
    }
    if (map.current.getSource('heatmap-data')) {
      map.current.removeSource('heatmap-data');
    }

    // Add heatmap source and layer
    map.current.addSource('heatmap-data', {
      type: 'geojson',
      data: heatmapData
    });

    map.current.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'heatmap-data',
      maxzoom: 9,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'risk'], 0, 0, 100, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgba(103,169,207,0.5)',
          0.4, 'rgba(209,229,240,0.6)',
          0.6, 'rgba(253,219,199,0.7)',
          0.8, 'rgba(239,138,98,0.8)',
          1, 'rgba(178,24,43,0.9)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 50]
      }
    });
  };

  const addLocationMarkers = () => {
    if (!map.current) return;

    locations.forEach(location => {
      const riskColors = {
        low: '#10b981',
        moderate: '#f59e0b', 
        high: '#ef4444'
      };

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'cyclone-marker';
      markerEl.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${riskColors[location.riskLevel]};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        transition: transform 0.2s ease;
      `;
      markerEl.textContent = location.riskScore.toString();

      // Hover effect
      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.3)';
        markerEl.style.zIndex = '1000';
      });
      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
        markerEl.style.zIndex = '1';
      });

      // Create marker
      const marker = new maplibregl.Marker(markerEl)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 30,
        closeButton: true,
        className: 'cyclone-popup'
      }).setHTML(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            ${location.name}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div>
              <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Risk Score</div>
              <div style="font-size: 18px; font-weight: bold; color: ${riskColors[location.riskLevel]};">
                ${location.riskScore}%
              </div>
            </div>
            <div>
              <div style="font-size: 11px; color: #666; margin-bottom: 2px;">Temperature</div>
              <div style="font-size: 14px; font-weight: 600;">${location.temperature}°C</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 8px;">
            <span style="
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              color: white;
              background: ${riskColors[location.riskLevel]};
              text-transform: uppercase;
            ">
              ${location.riskLevel} Risk
            </span>
          </div>
        </div>
      `);

      // Click handler
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        marker.setPopup(popup).togglePopup();
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      });

      markersRef.current.push(marker);
    });
  };

  const changeMapStyle = (newStyle: 'street' | 'satellite' | 'terrain') => {
    if (!map.current || !isLoaded) return;
    
    setCurrentStyle(newStyle);
    map.current.setStyle(getMapStyle(newStyle));
    
    map.current.once('styledata', () => {
      setTimeout(() => {
        if (enableHeatmap && locations.length > 0) {
          addHeatmapVisualization();
        }
      }, 100);
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden bg-gray-100"
        style={{ minHeight: '400px' }}
      />
      
      {/* Style Controls */}
      {interactive && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
            {(['street', 'satellite', 'terrain'] as const).map((style) => (
              <button
                key={style}
                onClick={() => changeMapStyle(style)}
                className={`px-3 py-2 text-sm font-medium transition-colors border-r last:border-r-0 ${
                  currentStyle === style 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Risk Legend */}
      {enableHeatmap && interactive && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg border p-3">
            <h4 className="text-sm font-semibold mb-2">Risk Levels</h4>
            <div className="space-y-1">
              {[
                { level: 'Low', color: '#10b981', range: '0-30%' },
                { level: 'Moderate', color: '#f59e0b', range: '30-60%' },
                { level: 'High', color: '#ef4444', range: '60%+' }
              ].map(({ level, color, range }) => (
                <div key={level} className="flex items-center text-xs">
                  <div 
                    className="w-3 h-3 rounded-full mr-2 border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{level} ({range})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-sm font-medium text-gray-600">Loading Map...</div>
          </div>
        </div>
      )}

      {/* MapLibre Attribution */}
      <div className="absolute bottom-2 right-2 z-10">
        <div className="bg-black/60 text-white text-xs px-2 py-1 rounded">
          MapLibre GL JS
        </div>
      </div>
    </div>
  );
};

export default CycloneMapLibre;
