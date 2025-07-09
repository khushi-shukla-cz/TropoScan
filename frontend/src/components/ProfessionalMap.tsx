import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ProfessionalMapProps {
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
  showHeatmap?: boolean;
}

const ProfessionalMap: React.FC<ProfessionalMapProps> = ({
  className = '',
  center = [77.0, 20.0], // [lng, lat] for MapLibre
  zoom = 5,
  locations = [],
  onLocationSelect,
  selectedLocation,
  showHeatmap = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'dark'>('street');
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const mapStyles = {
    street: {
      version: 8 as const,
      sources: {
        'osm-tiles': {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster' as const,
          source: 'osm-tiles'
        }
      ]
    },
    satellite: {
      version: 8 as const,
      sources: {
        'satellite-tiles': {
          type: 'raster' as const,
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '© Esri'
        }
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster' as const,
          source: 'satellite-tiles'
        }
      ]
    },
    dark: {
      version: 8 as const,
      sources: {
        'dark-tiles': {
          type: 'raster' as const,
          tiles: [
            'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© CartoDB'
        }
      },
      layers: [
        {
          id: 'dark-layer',
          type: 'raster' as const,
          source: 'dark-tiles'
        }
      ]
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyles[mapStyle],
        center: center,
        zoom: zoom,
        maxZoom: 18,
        minZoom: 2
      });

      // Add controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoaded(true);
        if (showHeatmap) {
          addHeatmapLayer();
        }
      });

      map.current.on('error', (e) => {
        console.error('MapLibre error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize MapLibre map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const addHeatmapLayer = () => {
    if (!map.current || !isLoaded || locations.length === 0) return;

    const heatmapData = {
      type: 'FeatureCollection' as const,
      features: locations.map(location => ({
        type: 'Feature' as const,
        properties: {
          risk: location.riskScore,
          name: location.name,
          temperature: location.temperature,
          coverage: location.coverage
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [location.lng, location.lat]
        }
      }))
    };

    if (!map.current.getSource('cyclone-heatmap')) {
      map.current.addSource('cyclone-heatmap', {
        type: 'geojson',
        data: heatmapData
      });

      // Add heatmap layer for lower zoom levels
      map.current.addLayer({
        id: 'cyclone-heatmap-layer',
        type: 'heatmap',
        source: 'cyclone-heatmap',
        maxzoom: 9,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'risk'],
            0, 0,
            100, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgba(103,169,207,0.6)',
            0.4, 'rgba(209,229,240,0.7)',
            0.6, 'rgba(253,219,199,0.8)',
            0.8, 'rgba(239,138,98,0.9)',
            1, 'rgba(178,24,43,1)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 20,
            9, 40
          ]
        }
      });

      // Add circle layer for higher zoom levels
      map.current.addLayer({
        id: 'cyclone-points',
        type: 'circle',
        source: 'cyclone-heatmap',
        minzoom: 7,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'risk'],
            0, 8,
            100, 25
          ],
          'circle-color': [
            'case',
            ['<', ['get', 'risk'], 30], '#22c55e',
            ['<', ['get', 'risk'], 60], '#f59e0b',
            '#ef4444'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add click handler for points
      map.current.on('click', 'cyclone-points', (e) => {
        if (e.features && e.features[0]) {
          const properties = e.features[0].properties;
          const location = locations.find(loc => loc.name === properties?.name);
          if (location && onLocationSelect) {
            onLocationSelect(location);
          }
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'cyclone-points', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'cyclone-points', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    }
  };

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for high zoom levels or as backup
    locations.forEach(location => {
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        transition: all 0.3s ease;
        z-index: 1000;
      `;

      const riskColors = {
        low: '#22c55e',
        moderate: '#f59e0b',
        high: '#ef4444'
      };

      markerElement.style.backgroundColor = riskColors[location.riskLevel];
      markerElement.textContent = location.riskScore.toString();

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
        markerElement.style.zIndex = '1001';
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.zIndex = '1000';
      });

      const marker = new maplibregl.Marker(markerElement)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      // Create detailed popup
      const popup = new maplibregl.Popup({
        offset: 35,
        closeButton: true,
        closeOnClick: false,
        className: 'cyclone-popup'
      }).setHTML(`
        <div style="padding: 15px; min-width: 250px; font-family: system-ui;">
          <div style="margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">
              ${location.name}
            </h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
              Last updated: ${new Date(location.lastUpdated).toLocaleString()}
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">Risk Score</div>
              <div style="font-size: 24px; font-weight: bold; color: ${riskColors[location.riskLevel]};">
                ${location.riskScore}%
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">Temperature</div>
              <div style="font-size: 18px; font-weight: 600; color: #1f2937;">
                ${location.temperature}°C
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">Cloud Coverage</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">
                ${location.coverage}%
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">Confidence</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">
                ${location.confidence}%
              </div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <span style="
              display: inline-block;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 600;
              color: white;
              background-color: ${riskColors[location.riskLevel]};
              text-transform: uppercase;
            ">
              ${location.riskLevel} Risk
            </span>
          </div>
        </div>
      `);

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        marker.setPopup(popup).togglePopup();
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      });

      markersRef.current.push(marker);
    });
  }, [locations, isLoaded, onLocationSelect]);

  // Update heatmap when data changes
  useEffect(() => {
    if (isLoaded && showHeatmap) {
      addHeatmapLayer();
    }
  }, [locations, isLoaded, showHeatmap]);

  const changeMapStyle = (newStyle: 'street' | 'satellite' | 'dark') => {
    if (map.current && isLoaded) {
      setMapStyle(newStyle);
      map.current.setStyle(mapStyles[newStyle]);
      
      // Re-add layers after style change
      map.current.once('styledata', () => {
        if (showHeatmap) {
          setTimeout(() => addHeatmapLayer(), 100);
        }
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Enhanced Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-3">
        {/* Map Style Switcher */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => changeMapStyle('street')}
            className={`px-3 py-2 text-sm font-medium transition-colors border-r border-gray-200 ${
              mapStyle === 'street' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => changeMapStyle('satellite')}
            className={`px-3 py-2 text-sm font-medium transition-colors border-r border-gray-200 ${
              mapStyle === 'satellite' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => changeMapStyle('dark')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              mapStyle === 'dark' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dark
          </button>
        </div>

        {/* Risk Level Legend */}
        {showHeatmap && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Cyclone Risk Levels</h4>
            <div className="space-y-2">
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-3 border border-white shadow-sm"></div>
                <span className="font-medium">Low Risk (0-30%)</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 rounded-full bg-amber-500 mr-3 border border-white shadow-sm"></div>
                <span className="font-medium">Moderate Risk (30-60%)</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-3 border border-white shadow-sm"></div>
                <span className="font-medium">High Risk (60%+)</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Click on markers for detailed information
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-pulse"></div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800 mb-1">Loading Professional Map</div>
              <div className="text-sm text-gray-600">Initializing cyclone risk visualization...</div>
            </div>
          </div>
        </div>
      )}

      {/* Powered by Badge */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
          Powered by MapLibre GL JS
        </div>
      </div>
    </div>
  );
};

export default ProfessionalMap;
