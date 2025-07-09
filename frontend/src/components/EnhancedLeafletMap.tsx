import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, AlertCircle, CheckCircle, Cloud, Thermometer, Activity } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { BaseLayer, Overlay } = LayersControl;

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

interface EnhancedMapProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
  selectedLocation: LocationData | null;
}

// Enhanced marker icons with more visual information
const createEnhancedIcon = (location: LocationData, isSelected: boolean = false) => {
  const colors = {
    high: '#ef4444',
    moderate: '#f59e0b',
    low: '#10b981'
  };

  const color = colors[location.riskLevel as keyof typeof colors];
  const size = isSelected ? 35 : 25;
  const riskScore = location.riskScore;

  return L.divIcon({
    className: 'enhanced-div-icon',
    html: `
      <div style="
        position: relative;
        background: linear-gradient(135deg, ${color}, ${color}cc);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: white;
        ${isSelected ? 'transform: scale(1.3); z-index: 1000;' : ''}
        ${location.riskLevel === 'high' ? 'animation: pulse 2s infinite;' : ''}
        transition: all 0.3s ease;
      ">
        <span style="font-size: 10px;">${riskScore}</span>
        ${location.riskLevel === 'high' ? `
          <div style="
            position: absolute;
            width: ${size + 10}px;
            height: ${size + 10}px;
            border: 2px solid ${color}66;
            border-radius: 50%;
            animation: ripple 2s infinite;
            top: -8px;
            left: -8px;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to handle map events and add weather overlays
const EnhancedMapEventHandler: React.FC<{ 
  selectedLocation: LocationData | null;
  locations: LocationData[];
}> = ({ selectedLocation, locations }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 9, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedLocation, map]);

  return null;
};

// Risk area visualization component
const RiskAreaOverlay: React.FC<{ locations: LocationData[] }> = ({ locations }) => {
  return (
    <>
      {locations.map((location, index) => (
        <Circle
          key={`risk-area-${index}`}
          center={[location.lat, location.lng]}
          radius={location.riskScore * 1000} // Radius based on risk score
          pathOptions={{
            color: location.riskLevel === 'high' ? '#ef4444' : 
                   location.riskLevel === 'moderate' ? '#f59e0b' : '#10b981',
            weight: 2,
            opacity: 0.6,
            fillColor: location.riskLevel === 'high' ? '#ef4444' : 
                      location.riskLevel === 'moderate' ? '#f59e0b' : '#10b981',
            fillOpacity: 0.1,
          }}
        />
      ))}
    </>
  );
};

const EnhancedLeafletMap: React.FC<EnhancedMapProps> = ({
  locations,
  onLocationSelect,
  selectedLocation
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [showRiskAreas, setShowRiskAreas] = useState(true);
  const [showWeatherData, setShowWeatherData] = useState(false);

  // Center of India
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 6;

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p>Loading enhanced map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg z-0"
      >
        <LayersControl position="topright">
          {/* Base Layers */}
          <BaseLayer checked name="Dark Theme">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </BaseLayer>
          
          <BaseLayer name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          
          <BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Terrain">
            <TileLayer
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png"
            />
          </BaseLayer>

          {/* Overlay Layers */}
          <Overlay checked={showRiskAreas} name="Risk Areas">
            <RiskAreaOverlay locations={locations} />
          </Overlay>

          {/* Weather Radar Overlay (simulated) */}
          <Overlay checked={showWeatherData} name="Weather Radar">
            <TileLayer
              attribution='Weather data simulation'
              url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=demo"
              opacity={0.6}
            />
          </Overlay>
        </LayersControl>

        {/* Enhanced Map Event Handler */}
        <EnhancedMapEventHandler 
          selectedLocation={selectedLocation} 
          locations={locations}
        />

        {/* Enhanced location markers */}
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={createEnhancedIcon(location, selectedLocation?.name === location.name)}
            eventHandlers={{
              click: () => onLocationSelect(location),
              mouseover: (e) => {
                e.target.openPopup();
              },
            }}
          >
            <Popup className="enhanced-popup">
              <div className="p-3 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {location.name}
                  </h3>
                  <Badge 
                    variant={location.riskLevel === 'high' ? 'destructive' : 
                            location.riskLevel === 'moderate' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {location.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Quick metrics */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center p-2 bg-gray-50 rounded">
                    <Activity className="h-4 w-4 text-red-500 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Risk Score</div>
                      <div className="font-bold text-sm">{location.riskScore}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded">
                    <Thermometer className="h-4 w-4 text-blue-500 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Temperature</div>
                      <div className="font-bold text-sm">{location.temperature}°C</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded">
                    <Cloud className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Coverage</div>
                      <div className="font-bold text-sm">{location.coverage.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className="font-bold text-sm">{location.confidence}%</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>

                <div className="text-xs text-gray-400 mb-3 pb-2 border-b">
                  Last updated: {new Date(location.lastUpdated).toLocaleString()}
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onLocationSelect(location)}
                >
                  📊 View Detailed Analysis
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Enhanced Legend */}
      <Card className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg z-[1000] max-w-xs">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
            🎯 Cyclone Risk Levels
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold">!</div>
                <span className="text-gray-700">High Risk</span>
              </div>
              <Badge variant="destructive" className="text-xs">70+</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold">⚠</div>
                <span className="text-gray-700">Moderate</span>
              </div>
              <Badge variant="default" className="text-xs">40-69</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold">✓</div>
                <span className="text-gray-700">Low Risk</span>
              </div>
              <Badge variant="secondary" className="text-xs">&lt;40</Badge>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t text-xs text-gray-500">
            💡 Numbers show risk scores • Click markers for details
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Controls */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2 z-[1000]">
        <Button
          variant={showRiskAreas ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowRiskAreas(!showRiskAreas)}
          className="bg-white/90 backdrop-blur-sm text-xs"
        >
          🎯 Risk Areas
        </Button>
        <Button
          variant={showWeatherData ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowWeatherData(!showWeatherData)}
          className="bg-white/90 backdrop-blur-sm text-xs"
        >
          🌧️ Weather
        </Button>
      </div>

      {/* Info Panel for Selected Location */}
      {selectedLocation && (
        <Card className="absolute top-4 right-4 w-72 bg-white/95 backdrop-blur-sm shadow-xl z-[1000]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">📍 Selected Location</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLocationSelect(selectedLocation)}
                className="text-xs"
              >
                View Trends →
              </Button>
            </div>
            <div className="text-sm text-gray-600 mb-2">{selectedLocation.name}</div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={selectedLocation.riskLevel === 'high' ? 'destructive' : 
                        selectedLocation.riskLevel === 'moderate' ? 'default' : 'secondary'}
              >
                {selectedLocation.riskLevel.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-500">
                Score: {selectedLocation.riskScore}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced CSS */}
      <style jsx global>{`
        .enhanced-div-icon {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .leaflet-popup-tip {
          background: white;
        }
        
        .leaflet-container {
          background: #1f2937;
        }
        
        .leaflet-control-layers {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border-radius: 8px !important;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default EnhancedLeafletMap;
