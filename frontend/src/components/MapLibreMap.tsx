import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    coordinates: [number, number];
    title: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
  }>;
  onMarkerClick?: (marker: any) => void;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({
  className = '',
  center = [20.0, 77.0], // Default to India
  zoom = 5,
  markers = [],
  onMarkerClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        // Using OpenStreetMap tiles with MapLibre GL JS
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            },
            'satellite-tiles': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
            }
          },
          layers: [
            {
              id: 'osm-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: center,
        zoom: zoom,
        maxZoom: 18,
        minZoom: 2
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add scale control
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

      // Add fullscreen control
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoaded(true);
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

  // Update map center and zoom
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1000
      });
    }
  }, [center, zoom, isLoaded]);

  // Handle markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const markerElement = document.createElement('div');
      markerElement.className = 'maplibre-marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      `;

      // Set marker color based on risk level
      const riskColors = {
        low: '#22c55e',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#dc2626'
      };
      markerElement.style.backgroundColor = riskColors[markerData.riskLevel];

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      const marker = new maplibregl.Marker(markerElement)
        .setLngLat(markerData.coordinates)
        .addTo(map.current!);

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${markerData.title}
          </h3>
          <div style="margin-bottom: 8px;">
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              color: white;
              background-color: ${riskColors[markerData.riskLevel]};
            ">
              ${markerData.riskLevel.toUpperCase()} RISK
            </span>
          </div>
          ${markerData.description ? `
            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.4;">
              ${markerData.description}
            </p>
          ` : ''}
        </div>
      `);

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        marker.setPopup(popup).togglePopup();
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      markersRef.current.push(marker);
    });
  }, [markers, isLoaded, onMarkerClick]);

  // Method to switch to satellite view
  const switchToSatellite = () => {
    if (map.current && isLoaded) {
      map.current.setStyle({
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      });
    }
  };

  // Method to switch to street view
  const switchToStreet = () => {
    if (map.current && isLoaded) {
      map.current.setStyle({
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
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
      
      {/* Map Type Switcher */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={switchToStreet}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-200 transition-colors"
          >
            Street
          </button>
          <button
            onClick={switchToSatellite}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLibreMap;
