interface StormPosition {
  lat: number;
  lon: number;
  timestamp: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

interface MovementPattern {
  primaryDirection: 'northwest' | 'north' | 'west';
  speed: number;
  curvature: number;
  landInteraction: boolean;
}

interface CycloneCharacteristics {
  id: string;
  name: string;
  coordinates: [number, number];
  windSpeed: number;
  pressure: number;
  status: 'active' | 'developing' | 'weakening';
  location: string;
}

interface PredictionContext {
  uploadedImages?: string[];
  historicalData?: StormPosition[];
  currentWeatherPattern?: string;
}

/**
 * Generates a realistic storm path based on cyclone characteristics and context
 */
export function generateDynamicStormPath(
  cyclone: CycloneCharacteristics,
  context: PredictionContext = {}
): StormPosition[] {
  const { coordinates, windSpeed, pressure, status, location, id } = cyclone;
  const [baseLon, baseLat] = coordinates;
  
  // Base movement direction and speed based on location and characteristics
  const movementPatterns = getMovementPattern(location, status, windSpeed);
  
  // Generate historical positions (last 18 hours)
  const historicalPositions: StormPosition[] = [];
  const timeIntervals = [18, 12, 6]; // hours ago
  
  timeIntervals.forEach((hoursAgo, index) => {
    const position = calculateHistoricalPosition(
      baseLat, 
      baseLon, 
      hoursAgo, 
      movementPatterns,
      index
    );
    
    historicalPositions.push({
      lat: position.lat,
      lon: position.lon,
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      riskLevel: getRiskLevelFromTime(hoursAgo, status)
    });
  });
  
  // Add current position
  historicalPositions.push({
    lat: baseLat,
    lon: baseLon,
    timestamp: new Date().toISOString(),
    riskLevel: getCurrentRiskLevel(windSpeed, pressure)
  });
  
  // Factor in uploaded images if available
  if (context.uploadedImages && context.uploadedImages.length > 0) {
    return enhancePathWithImageData(historicalPositions, context.uploadedImages, cyclone);
  }
  
  return historicalPositions;
}

/**
 * Generates a realistic forecast path for the next 120 hours
 */
export function generateDynamicForecastPath(
  cyclone: CycloneCharacteristics,
  context: PredictionContext = {}
): StormPosition[] {
  const { coordinates, windSpeed, pressure, status, location } = cyclone;
  const [baseLon, baseLat] = coordinates;
  
  const movementPatterns = getMovementPattern(location, status, windSpeed);
  const forecastPositions: StormPosition[] = [];
  
  // Generate forecast for next 120 hours (24-hour intervals)
  for (let hours = 24; hours <= 120; hours += 24) {
    const position = calculateForecastPosition(
      baseLat,
      baseLon,
      hours,
      movementPatterns,
      status,
      windSpeed,
      pressure
    );
    
    forecastPositions.push({
      lat: position.lat,
      lon: position.lon,
      timestamp: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
      riskLevel: getForecastRiskLevel(hours, status, windSpeed)
    });
  }
  
  // Add current position as starting point
  return [
    {
      lat: baseLat,
      lon: baseLon,
      timestamp: new Date().toISOString(),
      riskLevel: getCurrentRiskLevel(windSpeed, pressure)
    },
    ...forecastPositions
  ];
}

/**
 * Get movement patterns based on location and cyclone characteristics
 */
function getMovementPattern(location: string, status: string, windSpeed: number): MovementPattern {
  const patterns: Record<string, MovementPattern> = {
    'Arabian Sea': {
      primaryDirection: 'northwest',
      speed: 0.8, // degrees per hour
      curvature: 0.3,
      landInteraction: true
    },
    'Bay of Bengal': {
      primaryDirection: 'north',
      speed: 0.6,
      curvature: 0.5,
      landInteraction: true
    },
    'Indian Ocean': {
      primaryDirection: 'west',
      speed: 0.4,
      curvature: 0.2,
      landInteraction: false
    }
  };
  
  const basePattern = patterns[location] || patterns['Indian Ocean'];
  
  // Adjust speed based on intensity
  const intensityMultiplier = Math.min(windSpeed / 150, 2.0);
  basePattern.speed *= intensityMultiplier;
  
  // Adjust for status
  if (status === 'weakening') {
    basePattern.speed *= 0.7;
    basePattern.curvature *= 1.5; // More erratic when weakening
  } else if (status === 'developing') {
    basePattern.speed *= 1.2;
  }
  
  return basePattern;
}

/**
 * Calculate historical position based on reverse tracking
 */
function calculateHistoricalPosition(
  baseLat: number,
  baseLon: number,
  hoursAgo: number,
  patterns: MovementPattern,
  index: number
) {
  const timeProgress = hoursAgo / 24; // Convert to days
  
  // Reverse movement calculation
  let deltaLat = 0;
  let deltaLon = 0;
  
  switch (patterns.primaryDirection) {
    case 'northwest':
      deltaLat = -timeProgress * patterns.speed * 0.7;
      deltaLon = timeProgress * patterns.speed * 0.7;
      break;
    case 'north':
      deltaLat = -timeProgress * patterns.speed;
      deltaLon = Math.sin(timeProgress * patterns.curvature) * 0.3;
      break;
    case 'west':
      deltaLat = Math.sin(timeProgress * patterns.curvature) * 0.2;
      deltaLon = timeProgress * patterns.speed;
      break;
  }
  
  // Add some realistic variation
  const variation = 0.1 * Math.sin(index * 2.3 + timeProgress);
  
  return {
    lat: baseLat + deltaLat + variation,
    lon: baseLon + deltaLon + variation * 0.5
  };
}

/**
 * Calculate future forecast position
 */
function calculateForecastPosition(
  baseLat: number,
  baseLon: number,
  hoursAhead: number,
  patterns: MovementPattern,
  status: string,
  windSpeed: number,
  pressure: number
) {
  const timeProgress = hoursAhead / 24; // Convert to days
  
  let deltaLat = 0;
  let deltaLon = 0;
  
  switch (patterns.primaryDirection) {
    case 'northwest':
      deltaLat = timeProgress * patterns.speed * 0.7;
      deltaLon = -timeProgress * patterns.speed * 0.7;
      break;
    case 'north':
      deltaLat = timeProgress * patterns.speed;
      deltaLon = -Math.sin(timeProgress * patterns.curvature) * 0.3;
      break;
    case 'west':
      deltaLat = -Math.sin(timeProgress * patterns.curvature) * 0.2;
      deltaLon = -timeProgress * patterns.speed;
      break;
  }
  
  // Add intensity-based variation
  const intensityFactor = Math.min(windSpeed / 200, 1.5);
  const pressureFactor = Math.max((1000 - pressure) / 100, 0.5);
  
  // Add realistic environmental interaction
  const environmentalDrift = {
    lat: Math.sin(timeProgress * 0.5) * 0.2 * intensityFactor,
    lon: Math.cos(timeProgress * 0.3) * 0.15 * pressureFactor
  };
  
  // Factor in weakening over time
  let decayFactor = 1.0;
  if (status === 'weakening' || hoursAhead > 72) {
    decayFactor = Math.max(0.3, 1.0 - (hoursAhead - 72) / 200);
  }
  
  return {
    lat: baseLat + (deltaLat + environmentalDrift.lat) * decayFactor,
    lon: baseLon + (deltaLon + environmentalDrift.lon) * decayFactor
  };
}

/**
 * Enhance path prediction with uploaded image data
 */
function enhancePathWithImageData(
  basePath: StormPosition[],
  uploadedImages: string[],
  cyclone: CycloneCharacteristics
): StormPosition[] {
  // In a real implementation, this would analyze the uploaded images
  // to detect cloud patterns, eye wall structure, etc. to improve prediction
  
  // For now, we'll add some variation based on the number of images
  const imageAnalysisFactor = Math.min(uploadedImages.length / 10, 1.0);
  
  return basePath.map((position, index) => {
    // Simulate image-based correction
    const correction = {
      lat: (Math.random() - 0.5) * 0.2 * imageAnalysisFactor,
      lon: (Math.random() - 0.5) * 0.2 * imageAnalysisFactor
    };
    
    return {
      ...position,
      lat: position.lat + correction.lat,
      lon: position.lon + correction.lon,
      // Potentially more accurate risk assessment with image data
      riskLevel: position.riskLevel // Could be enhanced with image analysis
    };
  });
}

/**
 * Get risk level based on time in the past
 */
function getRiskLevelFromTime(hoursAgo: number, status: string): 'low' | 'moderate' | 'high' {
  if (status === 'weakening') return hoursAgo > 12 ? 'low' : 'moderate';
  if (status === 'developing') return hoursAgo > 12 ? 'low' : hoursAgo > 6 ? 'moderate' : 'high';
  return hoursAgo > 12 ? 'moderate' : 'high';
}

/**
 * Get current risk level based on wind speed and pressure
 */
function getCurrentRiskLevel(windSpeed: number, pressure: number): 'low' | 'moderate' | 'high' {
  if (windSpeed > 200 || pressure < 930) return 'high';
  if (windSpeed > 120 || pressure < 970) return 'moderate';
  return 'low';
}

/**
 * Get forecast risk level based on time and cyclone characteristics
 */
function getForecastRiskLevel(hoursAhead: number, status: string, windSpeed: number): 'low' | 'moderate' | 'high' {
  if (status === 'weakening') {
    if (hoursAhead > 72) return 'low';
    if (hoursAhead > 48) return 'moderate';
    return 'high';
  }
  
  if (status === 'developing') {
    if (hoursAhead > 96) return 'moderate';
    if (hoursAhead > 48) return 'high';
    return 'high';
  }
  
  // Active cyclone
  if (hoursAhead > 96) return 'moderate';
  return 'high';
}
