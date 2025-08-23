import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CycloneRiskMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  riskData?: Array<{
    coordinates: [number, number];
    riskLevel: number;
    cycloneActivity: number;
    name: string;
  }>;
  showRiskOverlay?: boolean;
}

const CycloneRiskMap: React.FC<CycloneRiskMapProps> = ({
  className = '',
  center = [20.0, 77.0],
  zoom = 5,
  riskData = [],
  showRiskOverlay = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSatellite, setShowSatellite] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            },
            'satellite-tiles': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              attribution: '© Esri'
            }
          },
          layers: [
            {
              id: 'base-layer',
              type: 'raster',
              source: 'osm-tiles'
            }
          ]
        },
        center: center,
        zoom: zoom
      });

      // Add controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        setIsLoaded(true);
        
        if (showRiskOverlay && map.current) {
          addRiskOverlay();
        }
      });

    } catch (error) {
      console.error('MapLibre initialization error:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const addRiskOverlay = () => {
    if (!map.current || !isLoaded) return;

    // Create heatmap data
    const heatmapData = {
      type: 'FeatureCollection' as const,
      features: riskData.map(point => ({
        type: 'Feature' as const,
        properties: {
          risk: point.riskLevel,
          activity: point.cycloneActivity,
          name: point.name
        },
        geometry: {
          type: 'Point' as const,
          coordinates: point.coordinates
        }
      }))
    };

    // Add heatmap source
    if (!map.current.getSource('risk-heatmap')) {
      map.current.addSource('risk-heatmap', {
        type: 'geojson',
        data: heatmapData
      });

      // Add heatmap layer
      map.current.addLayer({
        id: 'risk-heatmap-layer',
        type: 'heatmap',
        source: 'risk-heatmap',
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
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 20,
            9, 40
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            9, 0
          ]
        }
      });

      // Add circle layer for higher zoom levels
      map.current.addLayer({
        id: 'risk-points',
        type: 'circle',
        source: 'risk-heatmap',
        minzoom: 7,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'risk'],
            0, 5,
            100, 20
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'risk'],
            0, '#22c55e',
            30, '#f59e0b',
            60, '#ef4444',
            100, '#dc2626'
          ],
          'circle-opacity': 0.6,
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1
        }
      });
    }
  };

  const toggleSatellite = () => {
    if (!map.current || !isLoaded) return;

    if (showSatellite) {
      map.current.setLayoutProperty('base-layer', 'visibility', 'visible');
      if (map.current.getLayer('satellite-layer')) {
        map.current.setLayoutProperty('satellite-layer', 'visibility', 'none');
      }
    } else {
      map.current.setLayoutProperty('base-layer', 'visibility', 'none');
      
      if (!map.current.getLayer('satellite-layer')) {
        map.current.addLayer({
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite-tiles',
          layout: { visibility: 'visible' }
        }, 'risk-heatmap-layer');
      } else {
        map.current.setLayoutProperty('satellite-layer', 'visibility', 'visible');
      }
    }
    
    setShowSatellite(!showSatellite);
  };

  useEffect(() => {
    if (isLoaded && showRiskOverlay) {
      addRiskOverlay();
    }
  }, [riskData, isLoaded, showRiskOverlay]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={toggleSatellite}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
          >
            {showSatellite ? 'Street View' : 'Satellite'}
          </button>
        </div>
        
        {showRiskOverlay && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Risk Levels</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Low Risk (0-30)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span>Medium Risk (30-60)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>High Risk (60-100)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Loading cyclone risk map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycloneRiskMap;
