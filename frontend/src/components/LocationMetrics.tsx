import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Thermometer, 
  Cloud, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Activity
} from "lucide-react";

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

interface LocationMetricsProps {
  location: LocationData;
  isLoading: boolean;
}

const LocationMetrics: React.FC<LocationMetricsProps> = ({ location, isLoading }) => {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case "high":
        return {
          color: "red",
          bgClass: "bg-red-900/20 border-red-400/30",
          textClass: "text-red-400",
          description: "High cyclone formation probability detected",
          action: "Immediate monitoring and preparation required"
        };
      case "moderate":
        return {
          color: "yellow",
          bgClass: "bg-yellow-900/20 border-yellow-400/30",
          textClass: "text-yellow-400",
          description: "Organized cloud patterns with moderate risk",
          action: "Continue monitoring for development"
        };
      default:
        return {
          color: "green",
          bgClass: "bg-green-900/20 border-green-400/30",
          textClass: "text-green-400",
          description: "Normal atmospheric conditions",
          action: "Routine monitoring sufficient"
        };
    }
  };

  const config = getRiskConfig(location.riskLevel);

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
              <div className="h-6 w-48 bg-gray-600 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-700 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${config.bgClass} border-2`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className={`h-6 w-6 ${config.textClass}`} />
            <div>
              <CardTitle className="text-white text-xl">{location.name}</CardTitle>
              <p className="text-gray-400 text-sm">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant={location.riskLevel === "high" ? "destructive" : 
                      location.riskLevel === "moderate" ? "default" : "secondary"}
              className="text-sm font-bold mb-2"
            >
              {location.riskLevel.toUpperCase()} RISK
            </Badge>
            <div className="flex items-center text-gray-400 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(location.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Risk Description */}
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className={`h-5 w-5 ${config.textClass} mt-0.5`} />
            <div>
              <p className={`font-medium ${config.textClass} mb-1`}>
                {config.description}
              </p>
              <p className="text-gray-300 text-sm">
                {config.action}
              </p>
            </div>
          </div>
        </div>

        {/* Current Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Risk Score */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center mb-2">
              <Activity className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-sm text-gray-400">Risk Score</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{location.riskScore}</div>
            <Progress 
              value={location.riskScore} 
              className="h-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            />
            <div className="text-xs text-gray-400 mt-1">
              {location.riskScore >= 70 ? "Critical Level" : 
               location.riskScore >= 40 ? "Elevated Risk" : "Normal Range"}
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center mb-2">
              <Thermometer className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm text-gray-400">Temperature</span>
            </div>
            <div className="text-2xl font-bold text-white">{location.temperature}°C</div>
            <div className="text-xs text-gray-400 mt-1">
              {location.temperature < -70 ? "Very Cold - High Altitude" : 
               location.temperature < -60 ? "Cold - Storm Clouds" : 
               location.temperature < -50 ? "Moderate" : "Warm"}
            </div>
          </div>

          {/* Coverage */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center mb-2">
              <Cloud className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-gray-400">Coverage</span>
            </div>
            <div className="text-2xl font-bold text-white">{location.coverage.toFixed(2)}%</div>
            <div className="text-xs text-gray-400 mt-1">
              {location.coverage > 30 ? "Extensive" : 
               location.coverage > 15 ? "Significant" : 
               location.coverage > 5 ? "Moderate" : "Minimal"}
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm text-gray-400">Confidence</span>
            </div>
            <div className="text-2xl font-bold text-white">{location.confidence}%</div>
            <Progress 
              value={location.confidence} 
              className="h-2 mt-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            />
            <div className="text-xs text-gray-400 mt-1">
              {location.confidence >= 85 ? "Very High" : 
               location.confidence >= 70 ? "High" : 
               location.confidence >= 60 ? "Moderate" : "Low"}
            </div>
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-400/20">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">AI Risk Assessment</h4>
              <p className="text-gray-200 text-sm leading-relaxed">
                Based on satellite imagery analysis, this location shows{' '}
                <span className={`font-semibold ${config.textClass}`}>
                  {location.riskLevel} risk
                </span>{' '}
                cyclone formation patterns. The detected cloud coverage of {location.coverage.toFixed(1)}% 
                at {location.temperature}°C indicates{' '}
                {location.riskLevel === 'high' ? 'organized convective activity with potential for rapid development' :
                 location.riskLevel === 'moderate' ? 'developing weather systems requiring continued monitoring' :
                 'normal atmospheric conditions with minimal cyclone threat'}.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
          <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors">
            Set Alert
          </button>
          <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors">
            Share Analysis
          </button>
          <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors">
            Historical Data
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMetrics;
