import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './GoogleStyleMap.css';
import { 
  MapPin, Navigation, Layers, Satellite, RotateCcw, 
  ZoomIn, ZoomOut, Maximize2, Search, Settings,
  CloudRain, Eye, Activity, Thermometer, AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  lat: number;
  lng: number;
  name: string;
  riskScore: number;
  temperature: number;
  coverage: number;
  confidence: number;
  riskLevel: "low" | "moderate" | "high";
  lastUpdated: string;
}

interface SimpleMapProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
  selectedLocation: LocationData | null;
}

// Professional custom icons for different risk levels
const createProfessionalIcon = (riskLevel: string, isSelected: boolean = false) => {
  const iconConfig = {
    high: { color: '#dc2626', icon: '⚠️', shadow: '0 4px 12px rgba(220, 38, 38, 0.4)' },
    moderate: { color: '#ea580c', icon: '⚡', shadow: '0 4px 12px rgba(234, 88, 12, 0.4)' },
    low: { color: '#059669', icon: '✅', shadow: '0 4px 12px rgba(5, 150, 105, 0.4)' }
  };

  const config = iconConfig[riskLevel as keyof typeof iconConfig];
  const size = isSelected ? 44 : 36;
  const iconSize = isSelected ? 20 : 16;

  return L.divIcon({
    className: 'google-style-marker',
    html: `
      <div class="marker-container ${isSelected ? 'selected' : ''}" data-risk="${riskLevel}" style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <div class="marker-pin ${riskLevel === 'high' ? 'high-risk' : ''}" style="
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: ${config.shadow};
          border: 3px solid white;
          position: absolute;
          top: 0;
          left: 0;
        "></div>
        <div class="marker-icon" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -65%) rotate(45deg);
          font-size: ${iconSize}px;
          z-index: 10;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
        ">
          ${config.icon}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const SimpleGoogleMap: React.FC<SimpleMapProps> = ({
  locations,
  onLocationSelect,
  selectedLocation
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [tileLayer, setTileLayer] = useState<string>('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Center of India
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 6;

  const getTileLayerUrl = (layer: string) => {
    const layers = {
      street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
      },
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      },
      terrain: {
        url: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>'
      }
    };
    return layers[layer as keyof typeof layers] || layers.street;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
      });

      const currentTileLayer = getTileLayerUrl(tileLayer);
      L.tileLayer(currentTileLayer.url, {
        attribution: currentTileLayer.attribution,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update tile layer when changed
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing tile layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add new tile layer
    const currentTileLayer = getTileLayerUrl(tileLayer);
    L.tileLayer(currentTileLayer.url, {
      attribution: currentTileLayer.attribution,
    }).addTo(mapRef.current);
  }, [tileLayer]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      if (!mapRef.current) return;

      const marker = L.marker([location.lat, location.lng], {
        icon: createProfessionalIcon(location.riskLevel, selectedLocation?.name === location.name)
      });

      // Create popup content
      const popupContent = `
        <div class="min-w-[300px]">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-t-lg">
            <h3 class="font-bold text-lg">${location.name}</h3>
            <span class="inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
              location.riskLevel === 'high' ? 'bg-red-500' :
              location.riskLevel === 'moderate' ? 'bg-orange-500' : 'bg-green-500'
            }">
              ${location.riskLevel.toUpperCase()}
            </span>
          </div>
          <div class="bg-white p-3">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Risk Score:</strong> ${location.riskScore}</div>
              <div><strong>Confidence:</strong> ${location.confidence}%</div>
              <div><strong>Temperature:</strong> ${location.temperature}°C</div>
              <div><strong>Coverage:</strong> ${location.coverage.toFixed(1)}%</div>
            </div>
            <button 
              onclick="window.selectLocation('${location.name}')"
              class="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              View Detailed Analysis
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -20],
      });

      marker.on('click', () => {
        onLocationSelect(location);
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [locations, selectedLocation, mapReady, onLocationSelect]);

  // Handle location selection with smooth pan
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 10, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedLocation]);

  // Global function for popup buttons
  useEffect(() => {
    (window as any).selectLocation = (locationName: string) => {
      const location = locations.find(loc => loc.name === locationName);
      if (location) {
        onLocationSelect(location);
      }
    };

    return () => {
      delete (window as any).selectLocation;
    };
  }, [locations, onLocationSelect]);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  if (!mapReady) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-300 mx-auto animate-ping"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading interactive map...</p>
          <p className="text-gray-500 text-sm mt-1">Preparing your cyclone tracking experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'} bg-gray-100`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />

      {/* Search Bar */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-2 flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search locations..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch((e.target as HTMLInputElement).value)}
              className="border-0 focus:ring-0 w-48"
            />
          </CardContent>
        </Card>
      </div>

      {/* Custom zoom controls */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-[1000]">
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 bg-white shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => mapRef.current?.zoomIn()}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 bg-white shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => mapRef.current?.zoomOut()}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 bg-white shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => mapRef.current?.setView(defaultCenter, defaultZoom)}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-20 right-4 z-[1000]">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-2">
            <div className="flex flex-col space-y-1">
              {[
                { key: 'street', label: 'Street', icon: '🗺️' },
                { key: 'satellite', label: 'Satellite', icon: '🛰️' },
                { key: 'dark', label: 'Dark', icon: '🌙' },
                { key: 'terrain', label: 'Terrain', icon: '🏔️' }
              ].map((layer) => (
                <Button
                  key={layer.key}
                  variant={tileLayer === layer.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTileLayer(layer.key)}
                  className="justify-start text-xs w-full"
                >
                  <span className="mr-1">{layer.icon}</span>
                  {layer.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Legend */}
      <Card className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm shadow-xl border-0 z-[1000]">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <h4 className="font-bold text-gray-800">Cyclone Risk Levels</h4>
          </div>
          <div className="space-y-3">
            {[
              { level: 'high', color: '#dc2626', icon: '⚠️', label: 'High Risk', desc: 'Immediate attention required' },
              { level: 'moderate', color: '#ea580c', icon: '⚡', label: 'Moderate Risk', desc: 'Monitor closely' },
              { level: 'low', color: '#059669', icon: '✅', label: 'Low Risk', desc: 'Normal conditions' }
            ].map((item) => (
              <div key={item.level} className="flex items-center">
                <div 
                  className="w-6 h-6 rounded-full mr-3 flex items-center justify-center text-sm shadow-md"
                  style={{ backgroundColor: item.color, color: 'white' }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              Click markers for detailed analysis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleGoogleMap;
