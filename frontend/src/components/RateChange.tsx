import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Wind, Thermometer } from "lucide-react";

interface RateChangeProps {
  cycloneName: string;
  currentIntensity: number;
  status: 'active' | 'developing' | 'weakening';
}

const RateChange = ({ cycloneName, currentIntensity, status }: RateChangeProps) => {
  // Calculate mock intensity changes
  const getIntensityChange = () => {
    switch (status) {
      case 'developing':
        return { change: '+15', trend: 'up', color: 'text-red-400' };
      case 'weakening':
        return { change: '-8', trend: 'down', color: 'text-green-400' };
      default:
        return { change: '+3', trend: 'stable', color: 'text-yellow-400' };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const intensityChange = getIntensityChange();

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-400" />
          Intensity Rate of Change - {cycloneName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Intensity */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-400/30">
            <div className="flex items-center mb-2">
              <Wind className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm text-gray-400">Current Intensity</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{currentIntensity}</div>
            <div className="text-xs text-gray-400">km/h</div>
          </div>

          {/* Rate of Change */}
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-400/30">
            <div className="flex items-center mb-2">
              {getTrendIcon(intensityChange.trend)}
              <span className="text-sm text-gray-400 ml-2">Rate of Change</span>
            </div>
            <div className={`text-2xl font-bold ${intensityChange.color}`}>
              {intensityChange.change} km/h
            </div>
            <div className="text-xs text-gray-400">per 6 hours</div>
          </div>

          {/* Status */}
          <div className="bg-gray-900/20 rounded-lg p-4 border border-gray-400/30">
            <div className="flex items-center mb-2">
              <Thermometer className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Status</span>
            </div>
            <Badge 
              variant={status === 'active' ? 'destructive' : status === 'developing' ? 'default' : 'secondary'}
              className="text-lg px-3 py-1"
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Forecast */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-400/20">
          <h4 className="text-white font-medium mb-2">24-Hour Forecast</h4>
          <p className="text-gray-300 text-sm">
            {status === 'developing' && 
              `${cycloneName} is expected to continue intensifying with winds reaching ${currentIntensity + 25} km/h.`}
            {status === 'weakening' && 
              `${cycloneName} is expected to continue weakening with winds dropping to ${Math.max(currentIntensity - 20, 40)} km/h.`}
            {status === 'active' && 
              `${cycloneName} is expected to maintain current intensity with minor fluctuations.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateChange;
