import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface InteractiveMapLibreProps {
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
  onMapClick?: (coordinates: [number, number], locationData: any) => void;
  selectedLocation?: any;
  enableSearch?: boolean;
  enableHeatmap?: boolean;
}

const InteractiveMapLibre: React.FC<InteractiveMapLibreProps> = ({
  className = '',
  center = [77.0, 20.0],
  zoom = 5,
  locations = [],
  onLocationSelect,
  onMapClick,
  selectedLocation,
  enableSearch = true,
  enableHeatmap = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clickMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Function to generate realistic location data based on coordinates
  const generateLocationData = useCallback(async (lng: number, lat: number): Promise<any> => {
    // Try to get actual place name using reverse geocoding
    const getActualLocationName = async (lng: number, lat: number): Promise<string> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          // Extract meaningful place name from the response
          const address = data.address || {};
          const placeName = 
            address.city || 
            address.town || 
            address.village || 
            address.state_district || 
            address.county || 
            address.state || 
            data.display_name.split(',')[0] || 
            `Location ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
          
          return placeName;
        }
      } catch (error) {
        console.log('Reverse geocoding failed, using fallback naming');
      }
      
      // Fallback to improved regional naming
      return getFallbackLocationName(lng, lat);
    };

    // Improved fallback naming with more specific regions
    const getFallbackLocationName = (lng: number, lat: number): string => {
      const specificRegions = [
        // Major cities and specific areas
        { name: "Mumbai Metropolitan Area", bounds: { minLat: 18.8, maxLat: 19.3, minLng: 72.7, maxLng: 73.2 } },
        { name: "Delhi NCR", bounds: { minLat: 28.4, maxLat: 28.8, minLng: 76.8, maxLng: 77.3 } },
        { name: "Kolkata Metropolitan", bounds: { minLat: 22.3, maxLat: 22.8, minLng: 88.2, maxLng: 88.5 } },
        { name: "Chennai Metropolitan", bounds: { minLat: 12.8, maxLat: 13.3, minLng: 80.1, maxLng: 80.3 } },
        { name: "Bangalore Urban", bounds: { minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8 } },
        { name: "Hyderabad Metropolitan", bounds: { minLat: 17.2, maxLat: 17.6, minLng: 78.2, maxLng: 78.7 } },
        { name: "Pune Metropolitan", bounds: { minLat: 18.4, maxLat: 18.7, minLng: 73.7, maxLng: 74.0 } },
        
        // Coastal regions (high risk)
        { name: "Odisha Coastal Belt", bounds: { minLat: 19.0, maxLat: 22.0, minLng: 84.5, maxLng: 87.5 } },
        { name: "Andhra Pradesh Coast", bounds: { minLat: 13.5, maxLat: 19.0, minLng: 79.5, maxLng: 85.0 } },
        { name: "Tamil Nadu Coastal Plain", bounds: { minLat: 8.0, maxLat: 13.5, minLng: 78.0, maxLng: 81.0 } },
        { name: "West Bengal Coastal Area", bounds: { minLat: 21.5, maxLat: 24.5, minLng: 87.5, maxLng: 89.0 } },
        { name: "Kerala Coastal Region", bounds: { minLat: 8.0, maxLat: 12.5, minLng: 74.5, maxLng: 77.0 } },
        { name: "Karnataka Coast", bounds: { minLat: 12.5, maxLat: 15.0, minLng: 74.0, maxLng: 75.5 } },
        { name: "Gujarat Coastal Belt", bounds: { minLat: 20.0, maxLat: 24.0, minLng: 68.0, maxLng: 73.0 } },
        { name: "Maharashtra Coast", bounds: { minLat: 15.5, maxLat: 20.0, minLng: 72.0, maxLng: 74.0 } },
        
        // Interior regions
        { name: "Rajasthan Desert Region", bounds: { minLat: 24.0, maxLat: 30.0, minLng: 69.0, maxLng: 78.0 } },
        { name: "Madhya Pradesh Plateau", bounds: { minLat: 21.0, maxLat: 26.0, minLng: 74.0, maxLng: 82.0 } },
        { name: "Uttar Pradesh Plains", bounds: { minLat: 24.0, maxLat: 31.0, minLng: 77.0, maxLng: 85.0 } },
        { name: "Bihar Plains", bounds: { minLat: 24.0, maxLat: 27.5, minLng: 83.0, maxLng: 88.5 } },
        { name: "Jharkhand Plateau", bounds: { minLat: 21.5, maxLat: 25.5, minLng: 83.0, maxLng: 88.0 } },
        { name: "Chhattisgarh Plains", bounds: { minLat: 17.5, maxLat: 24.5, minLng: 80.0, maxLng: 84.5 } },
        
        // Mountain regions
        { name: "Western Ghats Region", bounds: { minLat: 8.0, maxLat: 21.0, minLng: 73.0, maxLng: 77.0 } },
        { name: "Eastern Ghats Belt", bounds: { minLat: 11.0, maxLat: 22.0, minLng: 77.0, maxLng: 85.0 } },
        { name: "Himalayan Foothills", bounds: { minLat: 28.0, maxLat: 35.0, minLng: 75.0, maxLng: 88.0 } },
        
        // Water bodies
        { name: "Bay of Bengal Waters", bounds: { minLat: 5.0, maxLat: 22.0, minLng: 85.0, maxLng: 95.0 } },
        { name: "Arabian Sea Region", bounds: { minLat: 8.0, maxLat: 25.0, minLng: 65.0, maxLng: 75.0 } },
        
        // Neighboring regions
        { name: "Bangladesh Border Region", bounds: { minLat: 22.0, maxLat: 26.5, minLng: 88.0, maxLng: 93.0 } },
        { name: "Pakistan Border Area", bounds: { minLat: 23.0, maxLat: 32.0, minLng: 68.0, maxLng: 76.0 } },
        { name: "Nepal Border Region", bounds: { minLat: 26.0, maxLat: 31.0, minLng: 80.0, maxLng: 88.0 } },
        { name: "Sri Lanka Strait", bounds: { minLat: 6.0, maxLat: 10.0, minLng: 79.0, maxLng: 82.0 } }
      ];

      for (const region of specificRegions) {
        if (lat >= region.bounds.minLat && lat <= region.bounds.maxLat &&
            lng >= region.bounds.minLng && lng <= region.bounds.maxLng) {
          return region.name;
        }
      }
      
      // Ultimate fallback with coordinates
      return `Location ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    };

    // Get the actual location name
    const locationName = await getActualLocationName(lng, lat);

    // Generate realistic risk score based on location
    const generateRiskScore = (lng: number, lat: number): number => {
      // Higher risk near coastal areas and cyclone-prone regions
      const distanceFromCoast = Math.min(
        Math.abs(lng - 85), // Bay of Bengal
        Math.abs(lng - 72), // Arabian Sea
        Math.abs(lat - 13)  // Southern coast
      );
      
      const coastalRisk = Math.max(0, 60 - distanceFromCoast * 5);
      const randomVariation = (Math.random() - 0.5) * 40;
      return Math.max(5, Math.min(95, coastalRisk + randomVariation));
    };

    // Generate realistic temperature (IR satellite data simulation)
    const generateTemperature = (lat: number): number => {
      const baseTemp = -60 - (lat - 15) * 2; // Colder at higher latitudes
      const cloudVariation = (Math.random() - 0.5) * 20;
      return Math.round((baseTemp + cloudVariation) * 10) / 10;
    };

    const riskScore = generateRiskScore(lng, lat);
    const temperature = generateTemperature(lat);
    const coverage = Math.round((20 + Math.random() * 50) * 100) / 100;
    const confidence = Math.round((60 + Math.random() * 35) * 100) / 100;

    const riskLevel = riskScore < 30 ? "low" : riskScore < 60 ? "moderate" : "high";

    return {
      lat,
      lng,
      name: locationName,
      riskScore: Math.round(riskScore),
      temperature,
      coverage,
      confidence: Math.round(confidence),
      riskLevel,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
  }, []);

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
        minZoom: 2
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        setIsLoaded(true);
      });

      // Add click handler for dynamic location selection
      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        
        // Generate dynamic location data with real place names
        const locationData = await generateLocationData(lng, lat);
        
        // Remove previous click marker
        if (clickMarkerRef.current) {
          clickMarkerRef.current.remove();
        }

        // Add new click marker
        const clickMarkerEl = document.createElement('div');
        clickMarkerEl.style.cssText = `
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          cursor: pointer;
          animation: pulse 2s infinite;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `;
        document.head.appendChild(style);

        clickMarkerRef.current = new maplibregl.Marker(clickMarkerEl)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        // Create detailed popup for clicked location
        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: true,
          className: 'dynamic-location-popup'
        }).setHTML(`
          <div style="padding: 15px; min-width: 250px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              📍 ${locationData.name}
            </h3>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px; padding: 4px 8px; background: #f3f4f6; rounded: 4px;">
              📍 ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                <div style="font-size: 11px; color: #6b7280;">Risk Score</div>
                <div style="font-size: 20px; font-weight: bold; color: ${locationData.riskLevel === 'high' ? '#ef4444' : locationData.riskLevel === 'moderate' ? '#f59e0b' : '#10b981'};">
                  ${locationData.riskScore}%
                </div>
              </div>
              <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                <div style="font-size: 11px; color: #6b7280;">Temperature</div>
                <div style="font-size: 16px; font-weight: 600;">${locationData.temperature}°C</div>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                <div style="font-size: 11px; color: #6b7280;">Coverage</div>
                <div style="font-size: 14px; font-weight: 600;">${locationData.coverage}%</div>
              </div>
              <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                <div style="font-size: 11px; color: #6b7280;">Confidence</div>
                <div style="font-size: 14px; font-weight: 600;">${locationData.confidence}%</div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 12px;">
              <div style="
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                color: white;
                background: ${locationData.riskLevel === 'high' ? '#ef4444' : locationData.riskLevel === 'moderate' ? '#f59e0b' : '#10b981'};
                text-transform: uppercase;
              ">
                ${locationData.riskLevel} Risk Zone
              </div>
            </div>
          </div>
        `);

        clickMarkerRef.current.setPopup(popup);
        popup.addTo(map.current!);

        // Trigger callbacks
        if (onMapClick) {
          onMapClick([lng, lat], locationData);
        }
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      });

      // Change cursor on hover to pointer finger
      map.current.on('mouseenter', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mousemove', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
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
  }, []);

  // Add predefined location markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    locations.forEach(location => {
      const riskColors = {
        low: '#10b981',
        moderate: '#f59e0b', 
        high: '#ef4444'
      };

      const markerEl = document.createElement('div');
      markerEl.style.cssText = `
        width: 16px;
        height: 16px;
        background: ${riskColors[location.riskLevel]};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const marker = new maplibregl.Marker(markerEl)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [locations, isLoaded]);

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim() || !map.current) return;
    
    setIsSearching(true);
    
    try {
      // Simple geocoding using Nominatim (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Fly to the searched location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 10,
          duration: 2000
        });
        
        // Generate location data for searched place
        const locationData = await generateLocationData(lng, lat);
        locationData.name = result.display_name.split(',')[0]; // Use search result name
        
        // Add marker and trigger selection
        if (clickMarkerRef.current) {
          clickMarkerRef.current.remove();
        }
        
        const searchMarkerEl = document.createElement('div');
        searchMarkerEl.style.cssText = `
          width: 24px;
          height: 24px;
          background: #8b5cf6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
          cursor: pointer;
        `;
        
        clickMarkerRef.current = new maplibregl.Marker(searchMarkerEl)
          .setLngLat([lng, lat])
          .addTo(map.current);
        
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const changeMapStyle = (newStyle: 'street' | 'satellite' | 'terrain') => {
    if (!map.current || !isLoaded) return;
    
    setCurrentStyle(newStyle);
    map.current.setStyle(getMapStyle(newStyle));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      {enableSearch && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white rounded-lg shadow-lg border p-2 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="px-3 py-2 text-sm border-none outline-none w-64 text-gray-900 bg-white placeholder-gray-500"
              style={{
                color: '#1f2937',
                backgroundColor: '#ffffff'
              }}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSearching ? '⏳' : '🔍'}
            </button>
          </div>
        </div>
      )}

      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden bg-gray-100"
        style={{ 
          minHeight: '400px',
          cursor: 'pointer'
        }}
      />
      
      {/* Style Controls */}
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

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg max-w-52">
          <div className="font-semibold mb-1">💡 Instructions:</div>
          <div>• Click anywhere to get exact location data</div>
          <div>• Search for cities, landmarks, or addresses</div>
          <div>• Switch map styles above</div>
          <div>• Real place names via geocoding</div>
        </div>
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-sm font-medium text-gray-600">Loading Interactive Map...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMapLibre;
