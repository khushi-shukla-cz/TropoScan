import React, { useRef, useEffect, useState } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Play, Pause, SkipForward, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


interface StormPosition {
  lat: number;
  lon: number;
  timestamp: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

interface PathPredictorProps {
  stormName?: string;
  positions?: StormPosition[];
  autoPlay?: boolean;
}

const PathPredictor = ({ 
  stormName = "Tropical System", 
  positions = [], 
  autoPlay = false
}: PathPredictorProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  
  // Generate demo data if no positions provided
  const stormPositions = React.useMemo(() => positions.length > 0 ? positions : [
    { lat: 18.2, lon: 72.8, timestamp: '2023-06-10T00:00:00Z', riskLevel: 'low' },
    { lat: 18.5, lon: 73.2, timestamp: '2023-06-10T06:00:00Z', riskLevel: 'low' },
    { lat: 18.9, lon: 73.7, timestamp: '2023-06-10T12:00:00Z', riskLevel: 'moderate' },
    { lat: 19.4, lon: 74.3, timestamp: '2023-06-10T18:00:00Z', riskLevel: 'moderate' },
    { lat: 20.1, lon: 75.0, timestamp: '2023-06-11T00:00:00Z', riskLevel: 'high' },
  ], [positions]);
  
  // Calculate the predicted next point using linear extrapolation
  const predictedPoint = React.useMemo(() => {
    if (stormPositions.length < 2) return null;
    
    const lastPoint = stormPositions[stormPositions.length - 1];
    const secondLastPoint = stormPositions[stormPositions.length - 2];
    
    // Calculate direction vector
    const latDiff = lastPoint.lat - secondLastPoint.lat;
    const lonDiff = lastPoint.lon - secondLastPoint.lon;
    
    // Extrapolate next point (6 hours into future if following sample pattern)
    return {
      lat: lastPoint.lat + latDiff,
      lon: lastPoint.lon + lonDiff,
      timestamp: 'Predicted',
      riskLevel: lastPoint.riskLevel || 'moderate' as const
    };
  }, [stormPositions]);
  
  const allPoints = React.useMemo(() => 
    [...stormPositions, ...(predictedPoint ? [predictedPoint] : [])],
    [stormPositions, predictedPoint]
  );
  
  // Format timestamp for display
  const formatTimestamp = React.useCallback((timestamp: string) => {
    if (timestamp === 'Predicted') return 'Predicted';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return timestamp;
    }
  }, []);
  
  // Get color based on risk level
  const getRiskColor = React.useCallback((riskLevel?: 'low' | 'moderate' | 'high') => {
    switch (riskLevel) {
      case 'high': return '#ef4444'; // red
      case 'moderate': return '#f59e0b'; // amber
      case 'low': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  }, []);
  
  const stopAnimation = React.useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);
  
  // Animation functions
  const startAnimation = React.useCallback(() => {
    if (animationRef.current !== null) return;
    
    setIsPlaying(true);
    let frame = currentFrameIndex;
    
    const animate = () => {
      if (frame < stormPositions.length) {
        setCurrentFrameIndex(frame);
        frame++;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        stopAnimation();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [currentFrameIndex, stormPositions, stopAnimation]);
  
  const toggleAnimation = React.useCallback(() => {
    if (isPlaying) {
      stopAnimation();
    } else {
      // Reset to beginning if at end
      if (currentFrameIndex >= stormPositions.length - 1) {
        setCurrentFrameIndex(0);
      }
      startAnimation();
    }
  }, [isPlaying, currentFrameIndex, stormPositions, stopAnimation, startAnimation]);
  
  // Reset animation
  const resetAnimation = React.useCallback(() => {
    stopAnimation();
    setCurrentFrameIndex(0);
  }, [stopAnimation]);
  
  // Jump to end
  const jumpToEnd = React.useCallback(() => {
    stopAnimation();
    setCurrentFrameIndex(stormPositions.length - 1);
  }, [stopAnimation, stormPositions]);
  
  useEffect(() => {
    // Initialize map if not already created
    if (!mapContainer.current || map.current) return;
    
    console.log("Initializing PathPredictor map");
    
    const center = stormPositions.length > 0 
      ? [stormPositions[0].lon, stormPositions[0].lat] as [number, number]
      : [73.0, 19.0] as [number, number];
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }]
      },
      center: center,
      zoom: 6
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Create cyclone icon element for marker
    const cycloneIcon = document.createElement('div');
    cycloneIcon.className = 'cyclone-marker';
    cycloneIcon.innerHTML = '🌀';
    cycloneIcon.style.fontSize = '24px';
    cycloneIcon.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))';
    
    // Initialize marker but don't add it yet
    markerRef.current = new maplibregl.Marker({ element: cycloneIcon });
    
    map.current.on('load', () => {
      if (!map.current) return;
      
      console.log("PathPredictor map loaded");
      
      // Add storm path as a polyline
      const coordinates = stormPositions.map(pos => [pos.lon, pos.lat]);
      
      map.current.addSource('storm-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });
      
      map.current.addLayer({
        id: 'storm-path-line',
        type: 'line',
        source: 'storm-path',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
      
      // Add predicted path as dashed line
      if (predictedPoint) {
        const lastPos = stormPositions[stormPositions.length - 1];
        
        map.current.addSource('predicted-path', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [lastPos.lon, lastPos.lat],
                [predictedPoint.lon, predictedPoint.lat]
              ]
            }
          }
        });
        
        map.current.addLayer({
          id: 'predicted-path-line',
          type: 'line',
          source: 'predicted-path',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ef4444',
            'line-width': 2,
            'line-opacity': 0.7,
            'line-dasharray': [2, 2]
          }
        });
      }
      
      // Add markers for each point
      stormPositions.forEach((pos, idx) => {
        const markerEl = document.createElement('div');
        markerEl.className = 'position-marker';
        markerEl.style.width = '12px';
        markerEl.style.height = '12px';
        markerEl.style.borderRadius = '50%';
        markerEl.style.background = getRiskColor(pos.riskLevel);
        markerEl.style.border = '2px solid white';
        
        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="padding: 8px; text-align: center;">
            <strong>${formatTimestamp(pos.timestamp)}</strong><br/>
            ${pos.lat.toFixed(2)}°N, ${pos.lon.toFixed(2)}°E<br/>
            ${pos.riskLevel ? `<span style="color:${getRiskColor(pos.riskLevel)}">${pos.riskLevel.toUpperCase()} RISK</span>` : ''}
          </div>
        `);
        
        new maplibregl.Marker({ element: markerEl })
          .setLngLat([pos.lon, pos.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });
      
      // Add marker for predicted point if available
      if (predictedPoint) {
        const predictedEl = document.createElement('div');
        predictedEl.className = 'predicted-marker';
        predictedEl.style.width = '12px';
        predictedEl.style.height = '12px';
        predictedEl.style.borderRadius = '50%';
        predictedEl.style.background = getRiskColor(predictedPoint.riskLevel as 'low' | 'moderate' | 'high');
        predictedEl.style.border = '2px solid white';
        predictedEl.style.opacity = '0.7';
        
        const predictedPopup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="padding: 8px; text-align: center;">
            <strong>PREDICTED LOCATION</strong><br/>
            ${predictedPoint.lat.toFixed(2)}°N, ${predictedPoint.lon.toFixed(2)}°E<br/>
            <small style="color:#f97316">*Based on current trajectory</small>
          </div>
        `);
        
        new maplibregl.Marker({ element: predictedEl })
          .setLngLat([predictedPoint.lon, predictedPoint.lat])
          .setPopup(predictedPopup)
          .addTo(map.current!);
      }
      
      // Position the moving marker initially
      if (stormPositions.length > 0) {
        const initialPos = stormPositions[0];
        markerRef.current!.setLngLat([initialPos.lon, initialPos.lat])
          .addTo(map.current!);
      }
      
      // Start animation if autoPlay is true
      if (autoPlay) {
        startAnimation();
      }
    });

    return () => {
      console.log("PathPredictor cleanup");
      stopAnimation();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [stormPositions, predictedPoint, autoPlay, startAnimation, stopAnimation, formatTimestamp, getRiskColor]);
  
  // Update marker position when currentFrameIndex changes
  useEffect(() => {
    if (!map.current || !markerRef.current || currentFrameIndex >= stormPositions.length) return;
    
    const currentPos = stormPositions[currentFrameIndex];
    markerRef.current.setLngLat([currentPos.lon, currentPos.lat]);
    
    // Fly the map to follow the marker
    map.current.flyTo({
      center: [currentPos.lon, currentPos.lat],
      speed: 0.3,
      essential: true
    });
  }, [currentFrameIndex, stormPositions]);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <div className="mr-2">🌪️</div>
          PathPredictor - {stormName} Movement Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="rounded-lg overflow-hidden border border-white/20">
          <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />
        </div>
        
        {/* Animation Controls */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button 
                onClick={toggleAnimation} 
                variant="outline" 
                size="sm"
              >
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button 
                onClick={resetAnimation} 
                variant="outline" 
                size="sm"
              >
                <SkipForward className="h-4 w-4 mr-2 rotate-180" />
                Reset
              </Button>
              <Button 
                onClick={jumpToEnd} 
                variant="outline" 
                size="sm"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                End
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                {currentFrameIndex < stormPositions.length 
                  ? formatTimestamp(stormPositions[currentFrameIndex].timestamp)
                  : 'End of track'}
              </span>
            </div>
          </div>
          
          {/* Timeline Slider - Simple range input */}
          <div className="pt-2">
            <input
              type="range"
              min={0}
              max={stormPositions.length - 1}
              step={1}
              value={currentFrameIndex}
              onChange={(e) => {
                stopAnimation();
                setCurrentFrameIndex(parseInt(e.target.value));
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentFrameIndex / (stormPositions.length - 1)) * 100}%, #374151 ${(currentFrameIndex / (stormPositions.length - 1)) * 100}%, #374151 100%)`
              }}
            />
          </div>
          
          {/* Timeline Labels */}
          <div className="flex justify-between text-xs text-gray-400">
            <div>Start</div>
            <div>Current Position</div>
            <div>Predicted</div>
          </div>
        </div>
        
        {/* Status Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Badge variant="outline" className="px-2 py-1 border-blue-400/30 text-blue-300">
            {stormPositions.length} tracked positions
          </Badge>
          {predictedPoint && (
            <Badge variant="outline" className="px-2 py-1 border-red-400/30 text-red-300">
              Next predicted: {predictedPoint.lat.toFixed(2)}°N, {predictedPoint.lon.toFixed(2)}°E
            </Badge>
          )}
          <Badge variant="outline" className="px-2 py-1 border-green-400/30 text-green-300">
            Trajectory extrapolated from historical data
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PathPredictor;
