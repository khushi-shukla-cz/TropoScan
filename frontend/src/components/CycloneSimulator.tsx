import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Wind, 
  Thermometer,
  Cloud,
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  Upload,
  RefreshCw
} from "lucide-react";
import DynamicTrajectoryForecast from './DynamicTrajectoryForecast';
import RateChange from './RateChange';
import DynamicPathPredictor from './DynamicPathPredictor';
import { generateDynamicStormPath, generateDynamicForecastPath } from '../utils/pathPrediction';

interface SimulationData {
  id: string;
  name: string;
  location: string;
  intensity: string;
  windSpeed: number;
  pressure: number;
  temperature: string;
  coordinates: [number, number];
  status: 'active' | 'developing' | 'weakening';
  lastUpdate: string;
}

const CycloneSimulator = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [selectedCyclone, setSelectedCyclone] = useState<string>('biparjoy');
  const [showForecasts, setShowForecasts] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [pathRegenerationKey, setPathRegenerationKey] = useState(0);
  
  // Mock cyclone data for simulation
  const cycloneData: Record<string, SimulationData> = {
    biparjoy: {
      id: 'biparjoy',
      name: 'Cyclone Biparjoy',
      location: 'Arabian Sea',
      intensity: 'Very Severe Cyclonic Storm',
      windSpeed: 165,
      pressure: 945,
      temperature: '-78°C',
      coordinates: [68.5, 19.2],
      status: 'active',
      lastUpdate: '2023-06-12 14:30 UTC'
    },
    mocha: {
      id: 'mocha',
      name: 'Cyclone Mocha',
      location: 'Bay of Bengal',
      intensity: 'Extremely Severe Cyclonic Storm',
      windSpeed: 250,
      pressure: 918,
      temperature: '-82°C',
      coordinates: [92.8, 18.5],
      status: 'active',
      lastUpdate: '2023-05-14 12:00 UTC'
    },
    amphan: {
      id: 'amphan',
      name: 'Super Cyclone Amphan',
      location: 'Bay of Bengal',
      intensity: 'Super Cyclonic Storm',
      windSpeed: 270,
      pressure: 912,
      temperature: '-85°C',
      coordinates: [89.2, 20.1],
      status: 'weakening',
      lastUpdate: '2020-05-20 06:00 UTC'
    }  };

  // Get current cyclone data
  const currentCyclone = cycloneData[selectedCyclone];
  
  // Generate new paths when cyclone changes or images are uploaded
  const regeneratePaths = () => {
    setPathRegenerationKey(prev => prev + 1);
    console.log('Regenerating paths for:', currentCyclone?.name);
  };
  
  // Effect to regenerate paths when cyclone selection changes
  useEffect(() => {
    if (showForecasts) {
      setPathRegenerationKey(prev => prev + 1);
      console.log('Regenerating paths for:', currentCyclone?.name);
    }
  }, [selectedCyclone, showForecasts, currentCyclone?.name]);
  
  // Handle image upload simulation
  const handleImageUpload = () => {
    const mockImagePaths = [
      `/mock-images/${selectedCyclone}-1.jpg`,
      `/mock-images/${selectedCyclone}-2.jpg`,
      `/mock-images/${selectedCyclone}-3.jpg`
    ];
    setUploadedImages(prev => [...prev, ...mockImagePaths]);
    regeneratePaths();
    console.log('Images uploaded for', currentCyclone?.name, ', regenerating paths...');
  };
  
  // Generate dynamic paths whenever cyclone changes or images are uploaded
  const dynamicStormPath = useMemo(() => {
    if (!currentCyclone) return [];
    
    console.log('Generating new storm path for:', currentCyclone.name, 'with', uploadedImages.length, 'images');
    return generateDynamicStormPath(currentCyclone, {
      uploadedImages,
      currentWeatherPattern: 'monsoon'
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCyclone, uploadedImages, pathRegenerationKey]);
  
  const dynamicForecastPath = useMemo(() => {
    if (!currentCyclone) return [];
    
    console.log('Generating new forecast path for:', currentCyclone.name, 'with', uploadedImages.length, 'images');
    return generateDynamicForecastPath(currentCyclone, {
      uploadedImages,
      currentWeatherPattern: 'monsoon'
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCyclone, uploadedImages, pathRegenerationKey]);

  const simulationSteps= [
    { stage: 'Detection', description: 'TropoScan AI detects initial cloud formation', progress: 20 },
    { stage: 'Analysis', description: 'Deep convection and temperature analysis', progress: 40 },
    { stage: 'Classification', description: 'Risk level assessment and prediction', progress: 60 },
    { stage: 'Tracking', description: 'Trajectory forecast and intensity prediction', progress: 80 },
    { stage: 'Complete', description: 'Full cyclone simulation with forecasts', progress: 100 }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulating && simulationStep < simulationSteps.length - 1) {
      interval = setInterval(() => {
        setSimulationStep(prev => {
          const next = prev + 1;
          if (next >= simulationSteps.length - 1) {
            setShowForecasts(true);
          }
          return next;
        });
      }, 2000);
    } else if (simulationStep >= simulationSteps.length - 1) {
      setIsSimulating(false);
    }

    return () => clearInterval(interval);
  }, [isSimulating, simulationStep, simulationSteps.length]);

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(0);
    setShowForecasts(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationStep(0);
    setShowForecasts(false);
  };

  const currentStep = simulationSteps[simulationStep];

  console.log('CycloneSimulator rendered with showForecasts:', showForecasts);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
          <Activity className="mr-3 h-8 w-8 text-blue-400" />
          Cyclone Development Simulator
        </h2>
        <p className="text-gray-300">
          Experience how TropoScan detects and forecasts tropical cyclone development in real-time.
          Watch the AI analysis process from initial detection to full trajectory prediction.
        </p>
      </div>

      {/* Cyclone Selection */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Cloud className="mr-2 h-5 w-5 text-blue-400" />
            Select Cyclone for Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(cycloneData).map((cyclone) => (
              <Card 
                key={cyclone.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCyclone === cyclone.id 
                    ? 'bg-blue-600/20 border-blue-400' 
                    : 'bg-white/5 border-white/10'
                }`}
                onClick={() => setSelectedCyclone(cyclone.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{cyclone.name}</h3>
                    <Badge 
                      variant={cyclone.status === 'active' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {cyclone.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {cyclone.location}
                    </div>
                    <div className="flex items-center">
                      <Wind className="w-3 h-3 mr-1" />
                      {cyclone.windSpeed} km/h
                    </div>
                    <div className="flex items-center">
                      <Thermometer className="w-3 h-3 mr-1" />
                      {cyclone.temperature}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-400" />
              Simulation Controls
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={startSimulation}
                disabled={isSimulating}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Simulation
              </Button>
              <Button
                onClick={() => setIsSimulating(!isSimulating)}
                disabled={simulationStep === 0}
                variant="outline"
                size="sm"
                className="border-white/20"
              >
                {isSimulating ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isSimulating ? 'Pause' : 'Resume'}
              </Button>
              <Button
                onClick={resetSimulation}
                variant="destructive"
                size="sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{currentStep.stage}</h3>
                <p className="text-gray-300 text-sm">{currentStep.description}</p>
              </div>
              <Badge 
                variant={currentStep.progress === 100 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {currentStep.progress}%
              </Badge>
            </div>
            <Progress value={currentStep.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Cyclone Info */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
            {currentCyclone.name} - Live Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-400/30">
              <div className="flex items-center mb-2">
                <Wind className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm text-gray-400">Wind Speed</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{currentCyclone.windSpeed}</div>
              <div className="text-xs text-gray-400">km/h</div>
            </div>
            
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-400/30">
              <div className="flex items-center mb-2">
                <Thermometer className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-sm text-gray-400">Cloud Top Temp</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{currentCyclone.temperature}</div>
              <div className="text-xs text-gray-400">Infrared</div>
            </div>
            
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-400/30">
              <div className="flex items-center mb-2">
                <Activity className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-400">Pressure</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{currentCyclone.pressure}</div>
              <div className="text-xs text-gray-400">hPa</div>
            </div>
            
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-400/30">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm text-gray-400">Last Update</span>
              </div>
              <div className="text-sm font-bold text-green-400">{currentCyclone.lastUpdate.split(' ')[1]}</div>
              <div className="text-xs text-gray-400">{currentCyclone.lastUpdate.split(' ')[0]}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Components - Only show when simulation is complete */}
      {showForecasts && (
        <div className="space-y-6">
          {/* Controls for Dynamic Path Generation */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
                  Dynamic Path Prediction Controls
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleImageUpload}
                    variant="outline"
                    size="sm"
                    className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images ({uploadedImages.length})
                  </Button>
                  <Button
                    onClick={regeneratePaths}
                    variant="outline"
                    size="sm"
                    className="border-green-400/30 text-green-300 hover:bg-green-400/10"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Paths
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-400/30">
                  <div className="text-blue-400 font-medium">Current Cyclone</div>
                  <div className="text-white">{currentCyclone.name}</div>
                  <div className="text-gray-400 text-xs">{currentCyclone.location}</div>
                </div>
                <div className="bg-green-900/20 rounded-lg p-3 border border-green-400/30">
                  <div className="text-green-400 font-medium">Uploaded Images</div>
                  <div className="text-white">{uploadedImages.length} files</div>
                  <div className="text-gray-400 text-xs">Enhanced prediction accuracy</div>
                </div>
                <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-400/30">
                  <div className="text-purple-400 font-medium">Path Generation</div>
                  <div className="text-white">Dynamic Mode</div>
                  <div className="text-gray-400 text-xs">Real-time updates</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold text-white mb-4">Advanced Storm Tracking & Forecasting</h2>
          <p className="text-gray-300 mb-6">
            Comprehensive cyclone analysis with trajectory prediction, movement tracking, and intensity forecasting
          </p>
          
          {/* DynamicPathPredictor Component */}
          <div key={`dynamic-path-predictor-${selectedCyclone}-${pathRegenerationKey}`}>
            <DynamicPathPredictor 
              stormName={currentCyclone.name}
              positions={dynamicStormPath}
            />
          </div>
          
          <div key={`dynamic-trajectory-forecast-${selectedCyclone}-${pathRegenerationKey}`}>
            <DynamicTrajectoryForecast 
              cycloneName={currentCyclone.name}
              coordinates={currentCyclone.coordinates}
              intensity={currentCyclone.intensity}
              forecastPath={dynamicForecastPath}
            />
          </div>
          
          <div key={`rate-change-${selectedCyclone}`}>
            <RateChange 
              cycloneName={currentCyclone.name}
              currentIntensity={currentCyclone.windSpeed}
              status={currentCyclone.status}
            />
          </div>
        </div>
      )}

      {/* Simulation Progress Indicator */}
      {isSimulating && (
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30 mt-6">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Simulation in Progress</h3>
                <p className="text-gray-300 text-sm">TropoScan AI is analyzing {currentCyclone.name}...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CycloneSimulator;
