import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface LeafletMapProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
  selectedLocation: LocationData | null;
}

// Custom marker icons for different risk levels
const createCustomIcon = (riskLevel: string, isSelected: boolean = false) => {
  const colors = {
    high: '#ef4444',
    moderate: '#f59e0b',
    low: '#10b981'
  };

  const color = colors[riskLevel as keyof typeof colors];
  const size = isSelected ? 30 : 20;
  const pulseClass = riskLevel === 'high' ? 'animate-pulse' : '';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        ${isSelected ? 'transform: scale(1.2);' : ''}
        ${riskLevel === 'high' ? 'animation: pulse 2s infinite;' : ''}
      ">
        ${riskLevel === 'high' ? '⚠' : riskLevel === 'moderate' ? '!' : '✓'}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to handle map events
const MapEventHandler: React.FC<{ selectedLocation: LocationData | null }> = ({ selectedLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 8, {
        animate: true,
        duration: 1,
      });
    }
  }, [selectedLocation, map]);

  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  locations,
  onLocationSelect,
  selectedLocation
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [tileLayer, setTileLayer] = useState<'osm' | 'satellite' | 'dark'>('dark');

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
          <p>Loading map...</p>
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
        {/* Dynamic tile layers */}
        {tileLayer === 'dark' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}
        
        {tileLayer === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        {tileLayer === 'satellite' && (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Map event handler */}
        <MapEventHandler selectedLocation={selectedLocation} />

        {/* Location markers */}
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.riskLevel, selectedLocation?.name === location.name)}
            eventHandlers={{
              click: () => onLocationSelect(location),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[250px]">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  {location.name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      location.riskLevel === 'high' ? 'bg-red-500 text-white' :
                      location.riskLevel === 'moderate' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {location.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Score:</span>
                      <span className="font-medium">{location.riskScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium">{location.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-medium">{location.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coverage:</span>
                      <span className="font-medium">{location.coverage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  Last updated: {new Date(location.lastUpdated).toLocaleString()}
                </div>

                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onLocationSelect(location)}
                >
                  View Detailed Trends
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <Card className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg z-[1000]">
        <CardContent className="p-3">
          <h4 className="text-sm font-semibold mb-2 text-gray-800">Risk Levels</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">⚠</div>
              <span className="text-gray-700">High Risk (70+)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">!</div>
              <span className="text-gray-700">Moderate Risk (40-69)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">✓</div>
              <span className="text-gray-700">Low Risk (&lt;40)</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Click markers for details
          </div>
        </CardContent>
      </Card>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
        <Button
          variant={tileLayer === 'dark' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTileLayer('dark')}
          className="bg-white/90 backdrop-blur-sm"
        >
          🌙 Dark
        </Button>
        <Button
          variant={tileLayer === 'satellite' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTileLayer('satellite')}
          className="bg-white/90 backdrop-blur-sm"
        >
          🛰️ Satellite
        </Button>
        <Button
          variant={tileLayer === 'osm' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTileLayer('osm')}
          className="bg-white/90 backdrop-blur-sm"
        >
          🗺️ Street
        </Button>
      </div>


    </div>
  );
};

export default LeafletMap;
