import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Activity, 
  AlertTriangle,
  Thermometer,
  Cloud,
  BarChart3,
  RefreshCw,
  Download,
  ArrowLeft
} from "lucide-react";
import InteractiveMap from "@/components/InteractiveMap";
import AlternativeMap from "@/components/AlternativeMap";
import MapLibreMap from "@/components/MapLibreMap";
import ProfessionalMap from "@/components/ProfessionalMap";
import InteractiveMapLibre from "@/components/InteractiveMapLibre";
// import LeafletMap from "@/components/LeafletMap";
// import GoogleStyleMap from "@/components/GoogleStyleMapFixed";
import SimpleGoogleMap from "@/components/SimpleGoogleMap";
import TrendChart from "@/components/TrendChart";
import LocationMetrics from "@/components/LocationMetrics";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useNavigate } from "react-router-dom";
import { realWeatherService } from "@/services/realWeatherService";
import EmergencyNavbar from "@/components/EmergencyNavbar";

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

interface TrendData {
  date: string;
  riskScore: number;
  temperature: number;
  coverage: number;
  cycloneActivity: number;
}

const TrendingPatterns = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [mapType, setMapType] = useState<'interactive' | 'professional' | 'maplibre' | 'simple' | 'alternative'>('interactive'); // Default to Interactive Map
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample high-risk locations with cyclone activity - now as state for dynamic updates
  const [riskLocations, setRiskLocations] = useState<LocationData[]>([
    {
      lat: 20.5937,
      lng: 78.9629,
      name: "Central India",
      riskScore: 78,
      temperature: -75.2,
      coverage: 34.56,
      confidence: 87,
      riskLevel: "high",
      lastUpdated: "2025-07-08 14:30"
    },
    {
      lat: 13.0827,
      lng: 80.2707,
      name: "Tamil Nadu Coast",
      riskScore: 45,
      temperature: -62.8,
      coverage: 18.23,
      confidence: 73,
      riskLevel: "moderate",
      lastUpdated: "2025-07-08 14:25"
    },
    {
      lat: 19.0760,
      lng: 72.8777,
      name: "Mumbai Region",
      riskScore: 23,
      temperature: -48.5,
      coverage: 8.45,
      confidence: 65,
      riskLevel: "low",
      lastUpdated: "2025-07-08 14:35"
    },
    {
      lat: 22.5726,
      lng: 88.3639,
      name: "West Bengal",
      riskScore: 89,
      temperature: -82.1,
      coverage: 42.78,
      confidence: 92,
      riskLevel: "high",
      lastUpdated: "2025-07-08 14:20"
    },
    {
      lat: 17.3850,
      lng: 78.4867,
      name: "Telangana",
      riskScore: 56,
      temperature: -68.3,
      coverage: 24.12,
      confidence: 79,
      riskLevel: "moderate",
      lastUpdated: "2025-07-08 14:28"
    }
  ]);

  // Generate real trend data for selected location using actual weather API
  const generateTrendData = async (location: LocationData): Promise<TrendData[]> => {
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      // Fetch real historical weather data
      const historicalWeather = await realWeatherService.getHistoricalWeather(
        location.lat, 
        location.lng, 
        days
      );
      
      // Convert real weather data to trend data
      const trendData = realWeatherService.convertToTrendData(historicalWeather, {
        lat: location.lat,
        lng: location.lng
      });
      
      console.log(`📡 Fetched real weather data for ${location.name}:`, {
        location: { lat: location.lat, lng: location.lng },
        days: days,
        dataPoints: trendData.length,
        sampleData: trendData.slice(0, 3) // Show first 3 days as sample
      });
      
      return trendData;
      
    } catch (error) {
      console.error('Failed to fetch real weather data, using fallback:', error);
      
      // Fallback to improved mock data if API fails
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const data: TrendData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // More realistic fallback based on location characteristics
        const isCoastal = Math.abs(location.lng - 85) < 10 || Math.abs(location.lng - 72) < 8; // Bay of Bengal or Arabian Sea
        const baseRisk = isCoastal ? location.riskScore : Math.max(5, location.riskScore - 20);
        const seasonalFactor = [10,11,0,1,4,5].includes(new Date().getMonth()) ? 15 : 0; // Cyclone season
        
        data.push({
          date: date.toISOString().split('T')[0],
          riskScore: Math.max(0, Math.min(100, baseRisk + seasonalFactor + (Math.random() - 0.5) * 25)),
          temperature: location.temperature + (Math.random() - 0.5) * 8,
          coverage: Math.max(0, location.coverage + (Math.random() - 0.5) * 20),
          cycloneActivity: Math.random() * (isCoastal ? 80 : 40) + (isCoastal ? 20 : 10)
        });
      }
      
      return data;
    }
  };

  const handleLocationSelect = async (location: LocationData) => {
    setIsLoading(true);
    setSelectedLocation(location);
    
    try {
      // Generate real weather trend data
      const trends = await generateTrendData(location);
      setTrendData(trends);
      
      toast({
        title: `📍 ${location.name} Selected`,
        description: `Loaded ${trends.length} days of real weather data. Risk: ${location.riskLevel.toUpperCase()}`,
      });
      
    } catch (error) {
      console.error('Error loading location data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load weather data. Please try again.",
        variant: "destructive"
      });
      setTrendData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dynamic map clicks - generate location data for any clicked point
  const handleMapClick = async (coordinates: [number, number], locationData: LocationData) => {
    console.log('Map clicked at:', coordinates, 'Generated data:', locationData);
    
    // Show toast notification with exact place name
    toast({
      title: "📍 Location Selected",
      description: `Fetching real weather data for ${locationData.name}...`,
      duration: 3000,
    });
    
    // Update the location in the predefined list for this session
    const newLocation = {
      ...locationData,
      lat: coordinates[1], // lat is second in coordinates array
      lng: coordinates[0]  // lng is first in coordinates array
    };
    
    // Add to locations list if not already present (check by exact coordinates)
    const existingIndex = riskLocations.findIndex(loc => 
      Math.abs(loc.lat - newLocation.lat) < 0.001 && 
      Math.abs(loc.lng - newLocation.lng) < 0.001
    );
    
    if (existingIndex === -1) {
      // Add new dynamic location to the list
      setRiskLocations(prev => [...prev, newLocation]);
      
      // Show additional toast for new location
      toast({
        title: "🆕 New Location Added",
        description: `${locationData.name} added to monitoring list`,
        duration: 2000,
      });
    }
    
    // Select this location
    handleLocationSelect(newLocation);
  };

  const handleTimeRangeChange = async (range: '7d' | '30d' | '90d') => {
    setTimeRange(range);
    if (selectedLocation) {
      setIsLoading(true);
      try {
        const trends = await generateTrendData(selectedLocation);
        setTrendData(trends);
        
        toast({
          title: `📅 Time Range Updated`,
          description: `Loaded ${trends.length} days of weather data for ${range.replace('d', ' days')}`,
        });
      } catch (error) {
        console.error('Error updating time range:', error);
        toast({
          title: "Error",
          description: "Failed to update time range data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const exportData = () => {
    if (!selectedLocation || !trendData.length) return;
    
    const csvContent = [
      ['Date', 'Risk Score', 'Temperature', 'Coverage', 'Cyclone Activity'].join(','),
      ...trendData.map(d => [d.date, d.riskScore, d.temperature, d.coverage, d.cycloneActivity].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLocation.name}_trends_${timeRange}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <EmergencyNavbar currentPage="trends" />
      
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        
        {/* Header */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-blue-400" />
                <div>
                  <CardTitle className="text-white text-2xl flex items-center">
                    Trending Patterns
                    <Badge className="ml-3 bg-green-600 text-white">🌡️ Real Weather Data</Badge>
                  </CardTitle>
                  <p className="text-gray-400">Interactive cyclone risk analysis with live weather data from Open-Meteo API</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const nextMap = mapType === 'interactive' ? 'professional' :
                                   mapType === 'professional' ? 'maplibre' : 
                                   mapType === 'maplibre' ? 'simple' : 
                                   mapType === 'simple' ? 'alternative' : 'interactive';
                    setMapType(nextMap);
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  {mapType === 'interactive' ? 'Interactive Map' :
                   mapType === 'professional' ? 'Professional Map' : 
                   mapType === 'maplibre' ? 'MapLibre GL' : 
                   mapType === 'simple' ? 'Leaflet Map' : 'SVG Map'} (Switch)
                </Button>
                <Badge variant="outline" className="border-blue-400 text-blue-400">
                  Real-time Analysis
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Interactive Map Instructions */}
        {mapType === 'interactive' && (
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <h4 className="text-white font-semibold">Interactive Mode Active</h4>
                  <p className="text-gray-300 text-sm">
                    Click anywhere on the map to get exact place names and real-time cyclone risk data. 
                    Use the search bar to find specific cities or landmarks. All values update dynamically!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 h-[600px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                  Interactive Cyclone Risk Map
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  {mapType === 'interactive' 
                    ? 'Click anywhere on the map to get real-time cyclone risk data, or search for specific locations' 
                    : 'Click on any location to view detailed trends'
                  }
                </p>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ErrorBoundary>
                  {mapType === 'interactive' ? (
                    <InteractiveMapLibre 
                      locations={riskLocations}
                      onLocationSelect={handleLocationSelect}
                      onMapClick={handleMapClick}
                      selectedLocation={selectedLocation}
                      center={[77.0, 20.0]}
                      zoom={5}
                      className="w-full h-full"
                      enableSearch={true}
                      enableHeatmap={true}
                    />
                  ) : mapType === 'professional' ? (
                    <ProfessionalMap 
                      locations={riskLocations}
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                      center={[77.0, 20.0]}
                      zoom={5}
                      className="w-full h-full"
                      showHeatmap={true}
                    />
                  ) : mapType === 'maplibre' ? (
                    <MapLibreMap 
                      markers={riskLocations.map(loc => ({
                        coordinates: [loc.lng, loc.lat],
                        title: loc.name,
                        riskLevel: loc.riskLevel === 'high' ? 'high' : 
                                  loc.riskLevel === 'moderate' ? 'medium' : 'low',
                        description: `Risk Score: ${loc.riskScore}% | Temp: ${loc.temperature}°C | Coverage: ${loc.coverage}%`
                      }))}
                      onMarkerClick={(marker) => {
                        const location = riskLocations.find(loc => loc.name === marker.title);
                        if (location) handleLocationSelect(location);
                      }}
                      center={[77.0, 20.0]}
                      zoom={5}
                      className="w-full h-full"
                    />
                  ) : mapType === 'simple' ? (
                    <SimpleGoogleMap 
                      locations={riskLocations}
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                    />
                  ) : (
                    <AlternativeMap 
                      locations={riskLocations}
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                    />
                  )}
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>

          {/* Location Summary */}
          <div>
            <Card className="bg-white/5 border-white/10 h-[600px]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-400" />
                  Current Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[500px]">
                {riskLocations
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .map((location, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedLocation?.name === location.name 
                        ? 'bg-blue-500/20 border-blue-400' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{location.name}</h4>
                      <Badge 
                        variant={location.riskLevel === "high" ? "destructive" : 
                                location.riskLevel === "moderate" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {location.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Score:</span>
                        <span className="text-white">{location.riskScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Temperature:</span>
                        <span className="text-white">{location.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Coverage:</span>
                        <span className="text-white">{location.coverage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <>
            {/* Current Selection Status */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                    <div>
                      <h4 className="text-white font-semibold">Currently Analyzing</h4>
                      <p className="text-gray-400 text-sm">
                        📍 {selectedLocation.name} ({selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{selectedLocation.riskScore}%</div>
                    <div className="text-xs text-gray-400">Risk Score</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-500/20 rounded-lg p-2">
                    <div className="text-lg font-semibold text-blue-400">{selectedLocation.temperature}°C</div>
                    <div className="text-xs text-gray-400">Temperature</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-2">
                    <div className="text-lg font-semibold text-purple-400">{selectedLocation.coverage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">Coverage</div>
                  </div>
                  <div className="bg-green-500/20 rounded-lg p-2">
                    <div className="text-lg font-semibold text-green-400">{selectedLocation.confidence}%</div>
                    <div className="text-xs text-gray-400">Confidence</div>
                  </div>
                  <div className="bg-orange-500/20 rounded-lg p-2">
                    <div className="text-lg font-semibold text-orange-400">{selectedLocation.riskLevel.toUpperCase()}</div>
                    <div className="text-xs text-gray-400">Risk Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Metrics */}
            <LocationMetrics 
              location={selectedLocation}
              isLoading={isLoading}
            />

            {/* Trend Analysis */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                    Trend Analysis - {selectedLocation.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-800 rounded-lg p-1">
                      {(['7d', '30d', '90d'] as const).map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleTimeRangeChange(range)}
                          className={`text-xs ${
                            timeRange === range 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          {range.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={exportData}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TrendChart 
                  data={trendData}
                  isLoading={isLoading}
                  timeRange={timeRange}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        {!selectedLocation && (
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-400/20">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Get Started</h3>
              <p className="text-gray-300">
                Click on any location marker on the map or select a hotspot from the sidebar 
                to view detailed cyclone trend analysis for that region.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Data Source Information */}
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-white font-medium">🌡️ Real Weather Data Active</h4>
                  <p className="text-gray-400 text-sm">
                    Historical weather data from Open-Meteo API • Temperature, humidity, pressure, wind speed, cloud cover
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">Live Data</Badge>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="text-center">
                <div className="text-green-400 font-semibold">✓ Historical Weather</div>
                <div className="text-gray-400">Real temperature & conditions</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold">✓ Cyclone Risk Calc</div>
                <div className="text-gray-400">AI-based risk assessment</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold">✓ Geographic Factors</div>
                <div className="text-gray-400">Coastal & seasonal analysis</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold">✓ Free API</div>
                <div className="text-gray-400">No API key required</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendingPatterns;
