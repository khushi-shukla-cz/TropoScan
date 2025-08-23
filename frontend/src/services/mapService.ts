// Service for integrating with various map APIs including SerpAPI
interface SerpAPIResponse {
  local_results?: Array<{
    position: number;
    title: string;
    place_id: string;
    lsig?: string;
    gps_coordinates?: {
      latitude: number;
      longitude: number;
    };
    rating?: number;
    reviews?: number;
    type?: string;
    address?: string;
  }>;
  search_metadata?: {
    status: string;
    processed_at: string;
  };
}

interface LocationSearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
  rating?: number;
  address?: string;
}

class MapService {
  private serpAPIKey: string;
  private baseURL: string = 'https://serpapi.com/search.json';
  private isConfigured: boolean = false;

  constructor(apiKey?: string) {
    // Handle environment variables safely for browser environment
    let envKey = '';
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Try to get environment variable, but don't fail if it's not available
        envKey = (window as any).VITE_SERP_API_KEY || '';
      }
    } catch (error) {
      // Silently continue without environment variable
      envKey = '';
    }
    
    this.serpAPIKey = apiKey || envKey;
    this.isConfigured = Boolean(this.serpAPIKey);
    
    // Log configuration status for debugging
    console.log('MapService initialized:', { 
      hasApiKey: this.isConfigured,
      willUseMockData: !this.isConfigured 
    });
  }

  /**
   * Search for locations using SerpAPI Google Maps engine
   */
  async searchLocations(
    query: string,
    latitude?: number,
    longitude?: number,
    zoom?: number
  ): Promise<LocationSearchResult[]> {
    if (!this.isConfigured) {
      console.info('SerpAPI not configured, using mock data for:', query);
      return this.getMockLocationData(query);
    }

    try {
      const params = new URLSearchParams({
        engine: 'google_maps',
        q: query,
        api_key: this.serpAPIKey
      });

      // Add location and zoom if provided
      if (latitude && longitude) {
        params.append('ll', `@${latitude},${longitude},${zoom || 10}z`);
      }

      const response = await fetch(`${this.baseURL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.status}`);
      }

      const data: SerpAPIResponse = await response.json();
      
      return this.parseSerpAPIResponse(data);
    } catch (error) {
      console.error('Error fetching from SerpAPI:', error);
      // Fallback to mock data
      return this.getMockLocationData(query);
    }
  }

  /**
   * Get weather station locations specifically
   */
  async getWeatherStations(region?: string): Promise<LocationSearchResult[]> {
    const query = region 
      ? `weather station meteorological observatory ${region}` 
      : 'weather station meteorological observatory India';
    
    return this.searchLocations(query);
  }

  /**
   * Get cyclone monitoring locations
   */
  async getCycloneMonitoringStations(): Promise<LocationSearchResult[]> {
    return this.searchLocations('cyclone monitoring station India meteorological department');
  }

  /**
   * Parse SerpAPI response to our format
   */
  private parseSerpAPIResponse(data: SerpAPIResponse): LocationSearchResult[] {
    if (!data.local_results) {
      return [];
    }

    return data.local_results
      .filter(result => result.gps_coordinates)
      .map(result => ({
        id: result.place_id,
        name: result.title,
        lat: result.gps_coordinates!.latitude,
        lng: result.gps_coordinates!.longitude,
        type: result.type,
        rating: result.rating,
        address: result.address
      }));
  }

  /**
   * Mock data for testing/fallback
   */
  private getMockLocationData(query: string): LocationSearchResult[] {
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
        id: 'mock_imd_kolkata',
        name: 'IMD Regional Meteorological Centre, Kolkata',
        lat: 22.5726,
        lng: 88.3639,
        type: 'meteorological_office',
        address: 'Kolkata, West Bengal'
      },
      {
        id: 'mock_imd_delhi',
        name: 'IMD Headquarters, New Delhi',
        lat: 28.6139,
        lng: 77.2090,
        type: 'meteorological_office',
        address: 'New Delhi'
      },
      {
        id: 'mock_cyclone_bhubaneswar',
        name: 'Cyclone Warning Centre, Bhubaneswar',
        lat: 20.2961,
        lng: 85.8245,
        type: 'cyclone_warning_centre',
        address: 'Bhubaneswar, Odisha'
      },
      {
        id: 'mock_cyclone_visakhapatnam',
        name: 'Cyclone Warning Centre, Visakhapatnam',
        lat: 17.6868,
        lng: 83.2185,
        type: 'cyclone_warning_centre',
        address: 'Visakhapatnam, Andhra Pradesh'
      }
    ];

    // Filter based on query
    if (query.toLowerCase().includes('cyclone')) {
      return mockStations.filter(station => station.type === 'cyclone_warning_centre');
    }
    
    if (query.toLowerCase().includes('weather') || query.toLowerCase().includes('meteorological')) {
      return mockStations.filter(station => station.type === 'meteorological_office');
    }

    return mockStations;
  }

  /**
   * Get reverse geocoding information
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!this.isConfigured) {
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    try {
      const params = new URLSearchParams({
        engine: 'google_maps',
        q: `${lat},${lng}`,
        api_key: this.serpAPIKey
      });

      const response = await fetch(`${this.baseURL}?${params}`);
      const data = await response.json();
      
      // Extract location name from response
      if (data.search_metadata?.google_maps_url) {
        return data.search_metadata.google_maps_url.split('@')[0] || `${lat}, ${lng}`;
      }
      
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}

// Utility functions for location-based operations
export const locationUtils = {
  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLng = this.degToRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  },

  /**
   * Find nearest monitoring station to a given location
   */
  findNearestStation(
    targetLat: number, 
    targetLng: number, 
    stations: LocationSearchResult[]
  ): LocationSearchResult | null {
    if (stations.length === 0) return null;

    let nearest = stations[0];
    let minDistance = this.calculateDistance(targetLat, targetLng, nearest.lat, nearest.lng);

    for (let i = 1; i < stations.length; i++) {
      const distance = this.calculateDistance(targetLat, targetLng, stations[i].lat, stations[i].lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = stations[i];
      }
    }

    return nearest;
  },

  /**
   * Check if coordinates are within Indian boundaries (rough approximation)
   */
  isWithinIndia(lat: number, lng: number): boolean {
    return lat >= 6.0 && lat <= 37.6 && lng >= 68.1 && lng <= 97.25;
  }
};

export type { LocationSearchResult, SerpAPIResponse };
export default MapService;
