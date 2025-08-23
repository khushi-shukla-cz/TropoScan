import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

// Fix for default markers in react-leaflet
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

interface GoogleStyleMapProps {
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

// Map controls component
const MapControls: React.FC<{
  tileLayer: string;
  setTileLayer: (layer: string) => void;
  onFullscreen: () => void;
  onSearch: (query: string) => void;
}> = ({ tileLayer, setTileLayer, onFullscreen, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-3 z-[1000]">
      {/* Search Bar */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-2 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
            className="border-0 focus:ring-0 w-48"
          />
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-1 flex flex-col space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
          className="w-8 h-8 p-0 hover:bg-gray-100"
          title="Map Layers"
        >
          <Layers className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onFullscreen}
          className="w-8 h-8 p-0 hover:bg-gray-100"
          title="Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 hover:bg-gray-100"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Layer Selector */}
      {showLayers && (
        <Card className="bg-white shadow-lg border-0 min-w-[200px]">
          <CardContent className="p-3">
            <h4 className="text-sm font-semibold mb-3 text-gray-800">Map Style</h4>
            <div className="space-y-2">
              {[
                { key: 'street', label: 'Street View', icon: '🗺️' },
                { key: 'satellite', label: 'Satellite', icon: '🛰️' },
                { key: 'hybrid', label: 'Hybrid', icon: '🌍' },
                { key: 'dark', label: 'Dark Mode', icon: '🌙' },
                { key: 'terrain', label: 'Terrain', icon: '🏔️' }
              ].map((layer) => (
                <Button
                  key={layer.key}
                  variant={tileLayer === layer.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTileLayer(layer.key)}
                  className="w-full justify-start text-sm"
                >
                  <span className="mr-2">{layer.icon}</span>
                  {layer.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Enhanced popup component
const EnhancedPopup: React.FC<{ location: LocationData; onSelect: () => void }> = ({ 
  location, 
  onSelect 
}) => {
  return (
    <div className="min-w-[320px] max-w-[400px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{location.name}</h3>
          <Badge 
            variant={location.riskLevel === 'high' ? 'destructive' : 
                    location.riskLevel === 'moderate' ? 'secondary' : 'default'}
            className="text-xs"
          >
            {location.riskLevel.toUpperCase()}
          </Badge>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          {new Date(location.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white p-4">
        {/* Risk Score Circle */}
        <div className="flex items-center justify-center mb-4">
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
            location.riskLevel === 'high' ? 'bg-red-100' :
            location.riskLevel === 'moderate' ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            <div className={`absolute inset-2 rounded-full flex items-center justify-center text-xl font-bold ${
              location.riskLevel === 'high' ? 'bg-red-500 text-white' :
              location.riskLevel === 'moderate' ? 'bg-orange-500 text-white' : 
              'bg-green-500 text-white'
            }`}>
              {location.riskScore}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-gray-500">Temperature</p>
              <p className="font-semibold">{location.temperature}°C</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Coverage</p>
              <p className="font-semibold">{location.coverage.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Confidence</p>
              <p className="font-semibold">{location.confidence}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">Activity</p>
              <p className="font-semibold">{location.riskLevel === 'high' ? 'High' : location.riskLevel === 'moderate' ? 'Medium' : 'Low'}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onSelect}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <Navigation className="h-4 w-4 mr-2" />
          View Detailed Analysis
        </Button>
      </div>
    </div>
  );
};

// Map event handler to capture map instance
const MapEventHandler: React.FC<{
  mapRef: React.MutableRefObject<L.Map | null>;
  selectedLocation: LocationData | null;
}> = ({ mapRef, selectedLocation }) => {
  const map = useMapEvents({
    // Just use the map instance directly
  });

  // Capture the map instance
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  // Handle location selection with smooth pan
  useEffect(() => {
    if (selectedLocation && map) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 10, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [selectedLocation, map]);

  return null;
};

const GoogleStyleMap: React.FC<GoogleStyleMapProps> = ({
  locations,
  onLocationSelect,
  selectedLocation
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [tileLayer, setTileLayer] = useState<string>('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Center of India
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 6;

  useEffect(() => {
    setMapReady(true);
  }, []);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality here
  };

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
      hybrid: {
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

  const currentTileLayer = getTileLayerUrl(tileLayer);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'} bg-gray-100`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        zoomControl={false}
        ref={mapRef}
      >
        {/* Map Event Handler */}
        <MapEventHandler mapRef={mapRef} selectedLocation={selectedLocation} />
        
        <TileLayer
          attribution={currentTileLayer.attribution}
          url={currentTileLayer.url}
        />

        {/* Location markers */}
        {locations.map((location, index) => (
          <Marker
            key={`marker-${index}-${location.name}`}
            position={[location.lat, location.lng]}
            icon={createProfessionalIcon(location.riskLevel, selectedLocation?.name === location.name)}
            eventHandlers={{
              click: () => onLocationSelect(location),
            }}
          >
            <Popup 
              className="google-style-popup"
              closeButton={false}
              offset={[0, -20]}
            >
              <EnhancedPopup 
                location={location} 
                onSelect={() => onLocationSelect(location)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

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

      {/* Map Controls */}
      <MapControls
        tileLayer={tileLayer}
        setTileLayer={setTileLayer}
        onFullscreen={handleFullscreen}
        onSearch={handleSearch}
      />

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

export default GoogleStyleMap;
