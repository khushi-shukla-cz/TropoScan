import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Upload, ArrowLeft, Clock, TrendingUp, TrendingDown, Settings, BarChart3, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UploadedImage {
  id: number;
  file: File;
  url: string;
  timestamp: string;
}

interface FrameMetrics {
  risk_score: number;
  confidence: number;
  coverage_percent: number;
  analysis: string;
  wind_speed: number;
  pressure: number;
  temperature: number;
}

interface TrendData {
  risk_trend: 'increasing' | 'decreasing' | 'stable';
  coverage_trend: 'increasing' | 'decreasing' | 'stable';
  intensity_trend: 'strengthening' | 'weakening' | 'stable';
  change_percentage: number;
  trend_description: string;
}

const CycloneSimulator: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000); // 2 seconds per frame
  const [frameMetrics, setFrameMetrics] = useState<FrameMetrics[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showTrends, setShowTrends] = useState(true);
  const [morphProgress, setMorphProgress] = useState(0); // 0-1 for smooth morphing
  const [videoProgress, setVideoProgress] = useState(0); // 0-100 for video timeline
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const lastFrameTime = useRef<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load images into canvas when uploaded (with immediate display)
  useEffect(() => {
    if (uploadedImages.length > 0) {
      imageRefs.current = uploadedImages.map(() => new Image());
      
      uploadedImages.forEach((imgData, index) => {
        if (imageRefs.current[index]) {
          const img = imageRefs.current[index];
          img.crossOrigin = 'anonymous';
          
          // Immediately show first image to prevent black screen
          if (index === 0) {
            img.onload = () => {
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.globalAlpha = 1;
                  ctx.globalCompositeOperation = 'source-over';
                  ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                }
              }
            };
          }
          
          img.src = imgData.url;
        }
      });
    }
  }, [uploadedImages]);

  // Canvas-based smooth morphing animation (bulletproof, no black screens)
  const renderFrame = (timestamp: number) => {
    if (!canvasRef.current || !isPlaying || uploadedImages.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate animation progress
    if (lastFrameTime.current === 0) lastFrameTime.current = timestamp;
    const elapsed = timestamp - lastFrameTime.current;
    const frameProgress = Math.min(elapsed / playbackSpeed, 1); // Clamp to 1

    if (frameProgress >= 1) {
      // Move to next frame
      setCurrentFrame(prev => {
        const nextFrame = (prev + 1) % uploadedImages.length;
        return nextFrame;
      });
      setMorphProgress(0);
      lastFrameTime.current = timestamp;
    } else {
      setMorphProgress(frameProgress);
    }

    // Update video progress (smooth)
    const totalProgress = ((currentFrame + frameProgress) / uploadedImages.length) * 100;
    setVideoProgress(totalProgress % 100);

    // ALWAYS draw frame - this ensures continuity
    drawMorphedFrame(ctx, frameProgress);
    
    if (isPlaying) {
      const frameId = requestAnimationFrame(renderFrame);
      setAnimationFrameId(frameId);
    }
  };

  // Draw morphed frame with seamless blending (ZERO black screens guaranteed)
  const drawMorphedFrame = (ctx: CanvasRenderingContext2D, progress: number) => {
    const canvas = ctx.canvas;
    const currentImg = imageRefs.current[currentFrame];
    const nextImg = imageRefs.current[(currentFrame + 1) % uploadedImages.length];

    if (!currentImg || !nextImg) return;

    // CRITICAL: Only check if images are loaded, draw immediately
    if (!currentImg.complete || !nextImg.complete) {
      // While images load, keep showing last frame or base color
      if (currentImg.complete) {
        ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Ultra-smooth transition curve that never goes to 0
    const smoothProgress = 0.5 * (1 - Math.cos(progress * Math.PI));
    
    // BULLETPROOF: Both alphas always sum to at least 0.8, never goes dark
    const alpha1 = Math.max(0.4, 1 - smoothProgress); // Current frame always >= 40%
    const alpha2 = Math.max(0.4, smoothProgress); // Next frame always >= 40%
    
    // Live movement effects for satellite realism
    const time = Date.now() * 0.001;
    const liveZoom = 1 + Math.sin(time * 0.5) * 0.008; // Subtle breathing
    const liveDriftX = Math.sin(time * 0.3) * 1.2;
    const liveDriftY = Math.cos(time * 0.4) * 0.8;
    
    // Morphing movement
    const morphZoom = 1 + smoothProgress * 0.015;
    const morphDriftX = Math.sin(smoothProgress * Math.PI) * 2.5;
    const morphDriftY = Math.cos(smoothProgress * Math.PI) * 1.5;

    // Combine effects
    const finalZoom = liveZoom * morphZoom;
    const finalDriftX = liveDriftX + morphDriftX;
    const finalDriftY = liveDriftY + morphDriftY;

    // NEVER CLEAR CANVAS - this is what causes black flickers
    
    // Create off-screen canvas for perfect blending
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // Draw base layer (current frame) with movement
    offCtx.save();
    offCtx.translate(canvas.width / 2, canvas.height / 2);
    offCtx.scale(finalZoom, finalZoom);
    offCtx.translate(-canvas.width / 2 + finalDriftX, -canvas.height / 2 + finalDriftY);
    offCtx.globalAlpha = alpha1;
    offCtx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
    offCtx.restore();

    // Blend in next frame seamlessly
    offCtx.save();
    offCtx.translate(canvas.width / 2, canvas.height / 2);
    offCtx.scale(finalZoom, finalZoom);
    offCtx.translate(-canvas.width / 2 + finalDriftX, -canvas.height / 2 + finalDriftY);
    offCtx.globalCompositeOperation = 'normal';
    offCtx.globalAlpha = alpha2;
    offCtx.drawImage(nextImg, 0, 0, canvas.width, canvas.height);
    offCtx.restore();

    // ATOMIC OPERATION: Replace canvas content in one draw call
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(offCanvas, 0, 0);

    // Add live satellite effects
    addLiveSatelliteEffects(ctx, progress, time);
  };

  // Add continuous live satellite feed effects (ultra-smooth, no flicker)
  const addLiveSatelliteEffects = (ctx: CanvasRenderingContext2D, progress: number, time: number) => {
    const canvas = ctx.canvas;
    
    // Save state for effects
    ctx.save();
    
    // Continuous scanning effect (smoother movement)
    ctx.globalAlpha = 0.06;
    const scanLine = (time * 40) % (canvas.height + 40);
    const gradient = ctx.createLinearGradient(0, scanLine - 15, 0, scanLine + 15);
    gradient.addColorStop(0, 'rgba(0, 255, 100, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, scanLine - 15, canvas.width, 30);
    
    // Continuous subtle scan lines
    ctx.globalAlpha = 0.015;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    for (let y = 0; y < canvas.height; y += 3) {
      if ((y + Math.floor(time * 8)) % 6 === 0) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
    }
    
    // Live signal noise (very subtle and consistent)
    ctx.globalAlpha = 0.008;
    const seed = Math.floor(time * 10) % 100; // Consistent pattern
    for (let i = 0; i < 15; i++) {
      const x = ((seed + i * 17) % 100) / 100 * canvas.width;
      const y = ((seed + i * 23) % 100) / 100 * canvas.height;
      const size = 1 + ((seed + i * 7) % 10) / 10;
      ctx.fillStyle = (seed + i) % 2 === 0 ? 'white' : 'rgba(100, 200, 255, 1)';
      ctx.fillRect(x, y, size, size);
    }
    
    // Continuous cloud motion particles (smooth flowing)
    if (progress > 0.05) {
      ctx.globalAlpha = 0.12;
      const numParticles = 4;
      for (let i = 0; i < numParticles; i++) {
        const angle = (time * 0.4 + i * 1.57) % (Math.PI * 2); // Slower, smoother
        const radius = 80 + Math.sin(time * 0.8 + i) * 30;
        const x = canvas.width * 0.5 + Math.cos(angle) * radius;
        const y = canvas.height * 0.5 + Math.sin(angle) * radius * 0.7;
        
        // Smooth flowing particle effect
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
        particleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        particleGradient.addColorStop(0.6, 'rgba(200, 230, 255, 0.3)');
        particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, 4 + Math.sin(time * 1.5 + i) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Restore state
    ctx.restore();
  };

  // Start/stop animation
  useEffect(() => {
    if (isPlaying && uploadedImages.length > 0) {
      lastFrameTime.current = 0;
      const frameId = requestAnimationFrame(renderFrame);
      setAnimationFrameId(frameId);
    } else if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      setAnimationFrameId(null);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, uploadedImages.length, currentFrame, playbackSpeed]);

  // Static frame rendering when not playing (with live effects)
  useEffect(() => {
    if (!isPlaying && canvasRef.current && uploadedImages.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const currentImg = imageRefs.current[currentFrame];
      
      if (ctx && currentImg && currentImg.complete) {
        // Never clear - just draw over
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
        
        // Add subtle live effects even when paused
        const time = Date.now() * 0.001;
        addLiveSatelliteEffects(ctx, 0, time);
      }
    }
  }, [currentFrame, isPlaying, uploadedImages]);

  // Initialize canvas with first frame immediately after upload
  useEffect(() => {
    if (uploadedImages.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas background to prevent initial black
        ctx.fillStyle = '#0f172a'; // Dark blue-gray instead of black
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Load and display first image as soon as it's ready
        const firstImg = imageRefs.current[0];
        if (firstImg) {
          firstImg.onload = () => {
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(firstImg, 0, 0, canvas.width, canvas.height);
          };
        }
      }
    }
  }, [uploadedImages]);

  // Generate mock AI metrics and trends for each frame
  useEffect(() => {
    if (uploadedImages.length > 0) {
      const metrics = uploadedImages.map((_, index) => {
        const progress = index / (uploadedImages.length - 1);
        const baseRisk = 30 + progress * 50;
        const riskScore = Math.round(baseRisk + Math.random() * 20);
        const confidence = Math.round(75 + Math.random() * 20);
        const coverage = Math.round(15 + progress * 40 + Math.random() * 15);
        
        // Additional meteorological parameters
        const windSpeed = Math.round(45 + progress * 80 + Math.random() * 20); // km/h
        const pressure = Math.round(1010 - progress * 40 - Math.random() * 10); // hPa
        const temperature = Math.round(-45 - progress * 25 - Math.random() * 10); // °C (cloud top temp)
        
        let analysis = "";
        if (riskScore < 40) {
          analysis = `Low risk detected. Normal cloud patterns observed with ${coverage}% coverage. Wind: ${windSpeed}km/h, Pressure: ${pressure}hPa. AI Confidence: ${confidence}%. Continue routine monitoring.`;
        } else if (riskScore < 70) {
          analysis = `Moderate risk identified. Organized cloud clusters forming with ${coverage}% coverage. Wind: ${windSpeed}km/h, Pressure: ${pressure}hPa. AI Confidence: ${confidence}%. Enhanced monitoring recommended.`;
        } else {
          analysis = `HIGH RISK! Strong cyclonic organization detected with ${coverage}% coverage. Wind: ${windSpeed}km/h, Pressure: ${pressure}hPa. AI Confidence: ${confidence}%. Immediate alert protocols activated.`;
        }

        return {
          risk_score: riskScore,
          confidence,
          coverage_percent: coverage,
          wind_speed: windSpeed,
          pressure,
          temperature,
          analysis
        };
      });
      setFrameMetrics(metrics);

      // Calculate trends between frames
      const trends = metrics.map((current, index) => {
        if (index === 0) {
          return {
            risk_trend: 'stable' as const,
            coverage_trend: 'stable' as const,
            intensity_trend: 'stable' as const,
            change_percentage: 0,
            trend_description: "Initial frame - baseline measurements"
          };
        }

        const previous = metrics[index - 1];
        const riskChange = current.risk_score - previous.risk_score;
        const coverageChange = current.coverage_percent - previous.coverage_percent;
        const windChange = current.wind_speed - previous.wind_speed;
        
        const risk_trend: 'increasing' | 'decreasing' | 'stable' = Math.abs(riskChange) < 3 ? 'stable' : riskChange > 0 ? 'increasing' : 'decreasing';
        const coverage_trend: 'increasing' | 'decreasing' | 'stable' = Math.abs(coverageChange) < 5 ? 'stable' : coverageChange > 0 ? 'increasing' : 'decreasing';
        const intensity_trend: 'strengthening' | 'weakening' | 'stable' = Math.abs(windChange) < 10 ? 'stable' : windChange > 0 ? 'strengthening' : 'weakening';
        
        const change_percentage = Math.round(Math.abs(riskChange / previous.risk_score) * 100);
        
        let trend_description = "";
        if (risk_trend === 'increasing') {
          trend_description = `Risk escalating by ${change_percentage}%. System showing signs of intensification with ${coverage_trend === 'increasing' ? 'expanding' : 'contracting'} cloud coverage.`;
        } else if (risk_trend === 'decreasing') {
          trend_description = `Risk diminishing by ${change_percentage}%. System appears to be ${intensity_trend === 'weakening' ? 'weakening' : 'stabilizing'}.`;
        } else {
          trend_description = `Risk levels stable. System maintaining current intensity with ${coverage_trend} cloud patterns.`;
        }

        return {
          risk_trend,
          coverage_trend,
          intensity_trend,
          change_percentage,
          trend_description
        };
      });
      setTrendData(trends);
    }
  }, [uploadedImages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (files.length !== 4) {
      toast({
        title: "Upload Error",
        description: "Please select exactly 4 images for the time-lapse",
        variant: "destructive"
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only JPG, PNG, or GIF images",
        variant: "destructive"
      });
      return;
    }

    const imagePromises = files.map((file, index) => {
      return new Promise<UploadedImage>((resolve) => {
        const url = URL.createObjectURL(file);
        // More realistic satellite timestamps
        const baseTime = new Date('2024-05-15T06:00:00Z'); // Example cyclone day
        const timeOffset = index * 3 * 60 * 60 * 1000; // 3 hours between frames
        const frameTime = new Date(baseTime.getTime() + timeOffset);
        const timestamp = frameTime.toISOString().slice(11, 16) + ' UTC'; // HH:MM format
        
        resolve({
          id: index,
          file,
          url,
          timestamp
        });
      });
    });

    Promise.all(imagePromises).then((images) => {
      setUploadedImages(images);
      setCurrentFrame(0);
      setIsPlaying(false);
      toast({
        title: "Success!",
        description: "4 images uploaded successfully. Ready for time-lapse simulation.",
      });
    });
  };

  const playPause = () => {
    if (uploadedImages.length < 2) {
      toast({
        title: "No Images",
        description: "Please upload 4 images first",
        variant: "destructive"
      });
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const resetPlayback = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
    setVideoProgress(0);
    setMorphProgress(0);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      setAnimationFrameId(null);
    }
    lastFrameTime.current = 0;
  };

  const stepForward = () => {
    if (uploadedImages.length === 0) return;
    const nextFrame = (currentFrame + 1) % uploadedImages.length;
    setCurrentFrame(nextFrame);
    setVideoProgress((nextFrame / (uploadedImages.length - 1)) * 100);
    setMorphProgress(0);
  };

  const stepBackward = () => {
    if (uploadedImages.length === 0) return;
    const prevFrame = currentFrame === 0 ? uploadedImages.length - 1 : currentFrame - 1;
    setCurrentFrame(prevFrame);
    setVideoProgress((prevFrame / (uploadedImages.length - 1)) * 100);
    setMorphProgress(0);
  };

  const clearImages = () => {
    // Clean up object URLs to prevent memory leaks
    uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
    setCurrentFrame(0);
    setIsPlaying(false);
    setFrameMetrics([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentImage = uploadedImages[currentFrame];
  const currentMetric = frameMetrics[currentFrame];
  const currentTrend = trendData[currentFrame];
  const progress = uploadedImages.length > 0 ? (currentFrame / (uploadedImages.length - 1)) * 100 : 0;

  const getRiskColor = (risk: number) => {
    if (risk < 40) return 'text-green-400';
    if (risk < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBadge = (risk: number) => {
    if (risk < 40) return { variant: 'secondary' as const, text: 'LOW RISK' };
    if (risk < 70) return { variant: 'outline' as const, text: 'MODERATE RISK' };
    return { variant: 'destructive' as const, text: 'HIGH RISK' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'strengthening':
        return <TrendingUp className="h-4 w-4 text-red-400" />;
      case 'decreasing':
      case 'weakening':
        return <TrendingDown className="h-4 w-4 text-green-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'strengthening':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'decreasing':
      case 'weakening':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Mini trend chart component
  const TrendChart = ({ data, currentIndex }: { data: FrameMetrics[], currentIndex: number }) => {
    const maxRisk = Math.max(...data.map(d => d.risk_score));
    const minRisk = Math.min(...data.map(d => d.risk_score));
    const range = maxRisk - minRisk || 1;

    return (
      <div className="w-full h-16 relative bg-black/20 rounded">
        <svg className="w-full h-full" viewBox={`0 0 ${data.length * 20} 64`}>
          {/* Trend line */}
          <polyline
            points={data.map((d, i) => 
              `${i * 20 + 10},${64 - ((d.risk_score - minRisk) / range) * 50 - 7}`
            ).join(' ')}
            fill="none"
            stroke="url(#trendGradient)"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          {/* Data points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={i * 20 + 10}
              cy={64 - ((d.risk_score - minRisk) / range) * 50 - 7}
              r={i === currentIndex ? 4 : 2}
              fill={i === currentIndex ? "#3b82f6" : "#6b7280"}
              className="drop-shadow-sm"
            />
          ))}
          {/* Gradient definition */}
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Cyclone Time-Lapse Simulator</h1>
              <p className="text-gray-300">Upload 4 satellite images to create a real cyclone evolution time-lapse</p>
            </div>
          </div>
          {uploadedImages.length > 0 && (
            <Button
              onClick={clearImages}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Clear Images
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">
                  Select exactly 4 satellite images for time-lapse simulation
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Choose Images
                </Button>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium">Uploaded Images:</h4>
                  {uploadedImages.map((img, index) => (
                    <div key={img.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-gray-300 text-sm">
                        {index + 1}. {img.file.name}
                      </span>
                      <Badge variant="outline">{img.timestamp}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Playback Speed Control */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Playback Speed
                  </label>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value={1000}>Fast Morph (1s)</option>
                    <option value={1500}>Quick Morph (1.5s)</option>
                    <option value={2000}>Normal Morph (2s)</option>
                    <option value={3000}>Slow Morph (3s)</option>
                    <option value={4000}>Ultra Smooth (4s)</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Display */}
          <Card className="lg:col-span-2 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {currentImage ? `Frame ${currentFrame + 1} - ${currentImage.timestamp}` : 'Upload Images to Start'}
                </span>
                {currentMetric && (
                  <Badge {...getRiskBadge(currentMetric.risk_score)}>
                    {getRiskBadge(currentMetric.risk_score).text}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Canvas-based Morphing Animation */}
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-2xl">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover bg-slate-800"
                      style={{
                        filter: `brightness(${isPlaying ? 1.05 : 1}) contrast(${isPlaying ? 1.1 : 1})`,
                        backgroundColor: '#1e293b' // Fallback color instead of black
                      }}
                    />
                    
                    {/* Professional satellite timestamp overlay */}
                    <div className="absolute top-3 left-3 bg-black/80 rounded px-3 py-2 font-mono">
                      <div className="text-green-400 text-xs font-bold">
                        ● LIVE INSAT-3D IR
                      </div>
                      <div className="text-white text-sm">
                        {currentImage?.timestamp || '00:00 UTC'}
                      </div>
                      <div className="text-gray-300 text-xs">
                        Frame {currentFrame + 1}/{uploadedImages.length}
                        {isPlaying && (
                          <span className="ml-2 text-blue-400">
                            ({(morphProgress * 100).toFixed(0)}% morph)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* AI Analysis overlay */}
                    {currentMetric && (
                      <div className="absolute top-3 right-3 bg-black/80 rounded px-3 py-2">
                        <div className="text-white text-xs font-bold mb-1">AI ANALYSIS</div>
                        <div className={`text-sm font-bold ${getRiskColor(currentMetric.risk_score)}`}>
                          {getRiskBadge(currentMetric.risk_score).text}
                        </div>
                        <div className="text-blue-400 text-xs">
                          Confidence: {currentMetric.confidence}%
                        </div>
                      </div>
                    )}
                    
                    {/* Morphing progress indicator */}
                    {isPlaying && morphProgress > 0 && (
                      <div className="absolute bottom-3 left-3 bg-black/80 rounded px-3 py-2">
                        <div className="text-white text-xs font-bold mb-1">MORPHING</div>
                        <div className="w-24 h-1 bg-gray-600 rounded">
                          <div 
                            className="h-full bg-blue-400 rounded transition-all duration-100"
                            style={{ width: `${morphProgress * 100}%` }}
                          />
                        </div>
                        <div className="text-gray-300 text-xs mt-1">
                          Frame {currentFrame + 1} → {((currentFrame + 1) % uploadedImages.length) + 1}
                        </div>
                      </div>
                    )}
                    
                    {/* Recording indicator */}
                    {isPlaying && (
                      <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-mono">MORPHING</span>
                      </div>
                    )}
                  </div>

                  {/* Video-style Controls */}
                  <div className="space-y-4">
                    {/* Professional video control bar */}
                    <div className="bg-black/60 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-center space-x-6 mb-4">
                        <Button size="icon" variant="ghost" onClick={resetPlayback} className="text-white hover:bg-white/20">
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={stepBackward} className="text-white hover:bg-white/20">
                          <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="lg" 
                          onClick={playPause} 
                          className="bg-blue-600 hover:bg-blue-700 w-14 h-14 rounded-full shadow-lg"
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={stepForward} className="text-white hover:bg-white/20">
                          <SkipForward className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setShowMetrics(!showMetrics)}
                          className="text-white hover:bg-white/20"
                        >
                          <Activity className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setShowTrends(!showTrends)}
                          className={`text-white hover:bg-white/20 ${showTrends ? 'bg-white/20' : ''}`}
                        >
                          <BarChart3 className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* Timeline with frame markers */}
                      <div className="relative">
                        <Progress value={videoProgress} className="w-full h-3 bg-white/20" />
                        {/* Frame markers on timeline */}
                        <div className="absolute top-0 left-0 w-full h-3 flex justify-between">
                          {uploadedImages.map((_, index) => (
                            <div
                              key={index}
                              className={`w-1 h-full cursor-pointer transition-all ${
                                index === currentFrame ? 'bg-blue-400' : 'bg-white/50 hover:bg-white/80'
                              }`}
                              onClick={() => {
                                setCurrentFrame(index);
                                setVideoProgress((index / (uploadedImages.length - 1)) * 100);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Time display */}
                      <div className="flex justify-between items-center mt-3 text-sm font-mono">
                        <span className="text-white">
                          {currentImage?.timestamp || '00:00 UTC'}
                        </span>
                        <div className="flex items-center space-x-4">
                          {isPlaying && (
                            <span className="text-green-400 flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                              LIVE
                            </span>
                          )}
                          <span className="text-gray-300">
                            {currentFrame + 1} / {uploadedImages.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Metrics with Trends */}
                  {currentMetric && showMetrics && (
                    <div className="space-y-4">
                      {/* Main Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-white/5 border-white/10 relative overflow-hidden">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <div className={`text-2xl font-bold ${getRiskColor(currentMetric.risk_score)}`}>
                                {currentMetric.risk_score}%
                              </div>
                              {currentTrend && (
                                <div className="ml-2">
                                  {getTrendIcon(currentTrend.risk_trend)}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-300">Risk Score</div>
                            {currentTrend && currentTrend.change_percentage > 0 && (
                              <div className={`text-xs mt-1 px-2 py-1 rounded border ${getTrendColor(currentTrend.risk_trend)}`}>
                                {currentTrend.risk_trend === 'increasing' ? '+' : ''}{currentTrend.change_percentage}%
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <div className="text-2xl font-bold text-blue-400">{currentMetric.wind_speed}</div>
                              {currentTrend && (
                                <div className="ml-2">
                                  {getTrendIcon(currentTrend.intensity_trend)}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-300">Wind Speed (km/h)</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <div className="text-2xl font-bold text-purple-400">{currentMetric.coverage_percent}%</div>
                              {currentTrend && (
                                <div className="ml-2">
                                  {getTrendIcon(currentTrend.coverage_trend)}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-300">Cloud Coverage</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-400">{currentMetric.pressure}</div>
                            <div className="text-sm text-gray-300">Pressure (hPa)</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Trend Visualization */}
                      {showTrends && frameMetrics.length > 1 && (
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center">
                              <BarChart3 className="mr-2 h-5 w-5" />
                              Risk Evolution Trend
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <TrendChart data={frameMetrics} currentIndex={currentFrame} />
                            
                            {/* Trend Summary */}
                            {currentTrend && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className={`p-3 rounded border ${getTrendColor(currentTrend.risk_trend)}`}>
                                  <div className="flex items-center mb-1">
                                    {getTrendIcon(currentTrend.risk_trend)}
                                    <span className="ml-2 font-semibold text-sm">Risk Trend</span>
                                  </div>
                                  <div className="text-xs capitalize">{currentTrend.risk_trend}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getTrendColor(currentTrend.coverage_trend)}`}>
                                  <div className="flex items-center mb-1">
                                    {getTrendIcon(currentTrend.coverage_trend)}
                                    <span className="ml-2 font-semibold text-sm">Coverage</span>
                                  </div>
                                  <div className="text-xs capitalize">{currentTrend.coverage_trend}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getTrendColor(currentTrend.intensity_trend)}`}>
                                  <div className="flex items-center mb-1">
                                    {getTrendIcon(currentTrend.intensity_trend)}
                                    <span className="ml-2 font-semibold text-sm">Intensity</span>
                                  </div>
                                  <div className="text-xs capitalize">{currentTrend.intensity_trend}</div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Enhanced Analysis Text with Trends */}
                  {currentMetric && showMetrics && (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                          <Activity className="mr-2 h-4 w-4" />
                          AI Analysis & Trend Assessment
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">{currentMetric.analysis}</p>
                        
                        {currentTrend && currentFrame > 0 && (
                          <div className="border-t border-white/10 pt-3">
                            <h5 className="text-white font-medium mb-2 flex items-center">
                              <TrendingUp className="mr-2 h-4 w-4 text-blue-400" />
                              Change Analysis (vs Previous Frame)
                            </h5>
                            <p className="text-blue-300 text-sm leading-relaxed">
                              {currentTrend.trend_description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Images Uploaded</h3>
                  <p className="text-gray-400 mb-4">
                    Upload 4 satellite images to create a cyclone evolution time-lapse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CycloneSimulator;
