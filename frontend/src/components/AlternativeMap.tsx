import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, AlertCircle, CheckCircle, MapPin, Loader2, Search,
  Navigation, ZoomIn, ZoomOut, RotateCcw, Layers, Home
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MapService, { LocationSearchResult, locationUtils } from '@/services/mapService';

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

interface AlternativeMapProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
  selectedLocation: LocationData | null;
}

interface SerpAPILocation {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  place_id?: string;
  rating?: number;
  reviews?: number;
  type?: string;
}

const AlternativeMap: React.FC<AlternativeMapProps> = ({
  locations,
  onLocationSelect,
  selectedLocation
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [zoom, setZoom] = useState(6);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapService, setMapService] = useState<MapService | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize MapService safely
  useEffect(() => {
    try {
      const service = new MapService();
      setMapService(service);
    } catch (error) {
      console.error('Failed to initialize MapService:', error);
      setInitError('Map service initialization failed. Using basic functionality.');
    }
  }, []);

  // Function to search locations using the MapService
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    if (!mapService) {
      console.warn('MapService not initialized, using mock data');
      setSearchResults(getMockSearchResults(query));
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await mapService.searchLocations(
        query,
        mapCenter.lat,
        mapCenter.lng,
        zoom
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults(getMockSearchResults(query));
    } finally {
      setIsSearching(false);
    }
  };

  // Mock search results fallback
  const getMockSearchResults = (query: string): LocationSearchResult[] => {
    const mockStations: LocationSearchResult[] = [
      {
        id: 'mock_imd_chennai',
        name: 'IMD Regional Meteorological Centre, Chennai',
        lat: 13.0827,
        lng: 80.2707,
        type: 'meteorological_office',
        address: 'Chennai, Tamil Nadu'
      },
      {
        id: 'mock_imd_mumbai',
        name: 'IMD Regional Meteorological Centre, Mumbai',
        lat: 19.0760,
        lng: 72.8777,
        type: 'meteorological_office',
        address: 'Mumbai, Maharashtra'
      },
      {
        id: 'mock_cyclone_bhubaneswar',
        name: 'Cyclone Warning Centre, Bhubaneswar',
        lat: 20.2961,
        lng: 85.8245,
        type: 'cyclone_warning_centre',
        address: 'Bhubaneswar, Odisha'
      }
    ];

    if (query.toLowerCase().includes('cyclone')) {
      return mockStations.filter(station => station.type === 'cyclone_warning_centre');
    }
    
    return mockStations.filter(station => station.type === 'meteorological_office');
  };

  // Load weather stations on component mount
  useEffect(() => {
    const loadWeatherStations = async () => {
      setIsSearching(true);
      try {
        if (mapService) {
          const stations = await mapService.getWeatherStations();
          setSearchResults(stations);
        } else {
          // Use mock data if service not available
          setSearchResults(getMockSearchResults('weather station'));
        }
      } catch (error) {
        console.error('Error loading weather stations:', error);
        setSearchResults(getMockSearchResults('weather station'));
      } finally {
        setIsSearching(false);
      }
    };

    if (mapService !== null) {
      loadWeatherStations();
    }
  }, [mapService]);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return AlertTriangle;
      case 'moderate':
        return AlertCircle;
      default:
        return CheckCircle;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      default:
        return 'text-green-400 bg-green-500/20 border-green-500';
    }
  };

  const handleLocationClick = (location: LocationData) => {
    setMapCenter({ lat: location.lat, lng: location.lng });
    onLocationSelect(location);
  };

  // Simulate map view with grid layout of locations
  const calculatePosition = (lat: number, lng: number) => {
    // Convert lat/lng to pixel positions for our mock map
    const centerLat = 20.5937;
    const centerLng = 78.9629;
    
    const x = ((lng - centerLng) * 8) + 50; // Scale and center
    const y = ((centerLat - lat) * 8) + 50; // Invert Y and center
    
    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`
    };
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg overflow-hidden">
      
      {/* Error Display */}
      {initError && (
        <div className="absolute top-2 right-2 bg-yellow-600/80 text-white p-2 rounded text-xs max-w-xs">
          ⚠️ {initError}
        </div>
      )}

      {/* Map Background */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Simplified India coastline */}
          <path
            d="M20,10 Q30,8 40,12 Q50,15 60,20 Q70,25 75,35 Q80,50 75,65 Q70,75 60,80 Q50,85 40,82 Q30,78 25,70 Q20,60 18,50 Q15,35 20,25 Q22,15 20,10"
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth="0.5"
          />
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <g key={i}>
              <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
              <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
            </g>
          ))}
        </svg>
      </div>

      {/* Location Markers */}
      {locations.map((location, index) => {
        const Icon = getRiskIcon(location.riskLevel);
        const position = calculatePosition(location.lat, location.lng);
        const isSelected = selectedLocation?.name === location.name;
        
        return (
          <div
            key={index}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
            }`}
            style={position}
            onClick={() => handleLocationClick(location)}
          >
            {/* Marker */}
            <div className={`
              relative w-8 h-8 rounded-full border-2 flex items-center justify-center
              ${getRiskColor(location.riskLevel)}
              ${isSelected ? 'animate-pulse' : ''}
            `}>
              <Icon className="w-4 h-4" />
              
              {/* Ripple effect for high risk */}
              {location.riskLevel === 'high' && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
              )}
            </div>

            {/* Location label */}
            <div className={`
              absolute top-10 left-1/2 transform -translate-x-1/2 
              bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap
              ${isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}
              transition-opacity duration-200
            `}>
              {location.name}
              <div className="text-xs text-gray-300">
                Risk: {location.riskScore}
              </div>
            </div>
          </div>
        );
      })}

      {/* Info Panel */}
      {selectedLocation && (
        <Card className="absolute top-4 right-4 w-72 bg-black/80 border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                selectedLocation.riskLevel === 'high' ? 'bg-red-500' :
                selectedLocation.riskLevel === 'moderate' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                {selectedLocation.riskLevel.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Coordinates:</span>
                <span>{selectedLocation.lat.toFixed(3)}, {selectedLocation.lng.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Risk Score:</span>
                <span className="font-bold">{selectedLocation.riskScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Temperature:</span>
                <span>{selectedLocation.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Coverage:</span>
                <span>{selectedLocation.coverage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Confidence:</span>
                <span>{selectedLocation.confidence}%</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20 text-xs text-gray-300">
              Last updated: {new Date(selectedLocation.lastUpdated).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(zoom + 1)}
          className="bg-black/60 border-white/20 text-white hover:bg-black/80"
        >
          +
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.max(1, zoom - 1))}
          className="bg-black/60 border-white/20 text-white hover:bg-black/80"
        >
          -
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg backdrop-blur-sm">
        <h4 className="text-sm font-semibold mb-2">Risk Levels</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>High Risk (70+)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Moderate Risk (40-69)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Low Risk (&lt;40)</span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-300">
          Click markers for details
        </div>
      </div>

      {/* Search Results Overlay */}
      {searchResults.length > 0 && (
        <Card className="absolute top-20 left-4 w-80 bg-black/90 border-white/20 text-white max-h-60 overflow-y-auto">
          <CardContent className="p-3">
            <h4 className="text-sm font-semibold mb-2">Found Locations ({searchResults.length})</h4>
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <div 
                  key={result.id || index}
                  className="p-2 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => {
                    setMapCenter({ lat: result.lat, lng: result.lng });
                    // You could also create a location data object and select it
                  }}
                >
                  <div className="text-sm font-medium">{result.name}</div>
                  {result.address && (
                    <div className="text-xs text-gray-300">{result.address}</div>
                  )}
                  <div className="text-xs text-blue-300">
                    {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                    {result.type && ` • ${result.type.replace('_', ' ')}`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Integration */}
      <div className="absolute top-4 left-4 flex space-x-2">
        <div className="flex">
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
            className="w-48 bg-black/60 border-white/20 text-white placeholder-gray-400"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => searchLocation(searchQuery)}
            disabled={isSearching}
            className="ml-1 bg-black/60 border-white/20 text-white hover:bg-black/80"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => searchLocation('cyclone monitoring station')}
          disabled={isSearching}
          className="bg-black/60 border-white/20 text-white hover:bg-black/80"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Find Monitors
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AlternativeMap;
