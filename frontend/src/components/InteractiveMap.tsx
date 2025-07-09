import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

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

interface InteractiveMapProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
  selectedLocation: LocationData | null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  onLocationSelect,
  selectedLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{"color": "#1d2c4d"}]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#8ec3b9"}]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#1a3646"}]
          },
          {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#4b6878"}]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#64779e"}]
          },
          {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#4b6878"}]
          },
          {
            "featureType": "landscape.man_made",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#334e87"}]
          },
          {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [{"color": "#023e58"}]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{"color": "#283d6a"}]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#6f9ba5"}]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#1d2c4d"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#023e58"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#3C7680"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{"color": "#304a7d"}]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#98a5be"}]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#1d2c4d"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{"color": "#2c6675"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#255763"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#b0d5ce"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#023e58"}]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#98a5be"}]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#1d2c4d"}]
          },
          {
            "featureType": "transit.line",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#283d6a"}]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [{"color": "#3a4762"}]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#0e1626"}]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#4e6d70"}]
          }
        ]
      });

      setMap(mapInstance);
    };

    loadGoogleMaps();
  }, []);

  // Create markers when map is ready
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = locations.map(location => {
      // Create custom marker based on risk level
      const getRiskIcon = (riskLevel: string) => {
        const colors = {
          high: '#ef4444',
          moderate: '#f59e0b',
          low: '#10b981'
        };
        
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: colors[riskLevel as keyof typeof colors],
          fillOpacity: 0.8,
          scale: location.riskScore / 5, // Scale based on risk score
          strokeColor: '#ffffff',
          strokeWeight: 2,
        };
      };

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: getRiskIcon(location.riskLevel),
        animation: google.maps.Animation.DROP
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #333; padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
              ${location.name}
            </h3>
            <div style="display: grid; gap: 4px; font-size: 14px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Risk Score:</span>
                <strong style="color: ${location.riskLevel === 'high' ? '#ef4444' : location.riskLevel === 'moderate' ? '#f59e0b' : '#10b981'}">
                  ${location.riskScore}
                </strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Temperature:</span>
                <strong>${location.temperature}°C</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Coverage:</span>
                <strong>${location.coverage.toFixed(1)}%</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Confidence:</span>
                <strong>${location.confidence}%</strong>
              </div>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              Last updated: ${new Date(location.lastUpdated).toLocaleString()}
            </div>
            <button 
              onclick="window.selectLocation('${location.name}')"
              style="
                margin-top: 8px; 
                padding: 6px 12px; 
                background: #3b82f6; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 12px;
                width: 100%;
              "
            >
              View Detailed Trends
            </button>
          </div>
        `
      });

      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onLocationSelect(location);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Global function for info window button
    (window as any).selectLocation = (locationName: string) => {
      const location = locations.find(loc => loc.name === locationName);
      if (location) {
        onLocationSelect(location);
      }
    };
  }, [map, locations, onLocationSelect]);

  // Highlight selected location
  useEffect(() => {
    if (!selectedLocation || !map) return;

    // Center map on selected location
    map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    
    // Optional: Add a pulsing animation to the selected marker
    const selectedMarker = markers.find(marker => 
      marker.getTitle() === selectedLocation.name
    );
    
    if (selectedMarker) {
      selectedMarker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => {
        selectedMarker.setAnimation(null);
      }, 2000);
    }
  }, [selectedLocation, map, markers]);

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg backdrop-blur-sm">
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
      </div>

      {/* Loading overlay */}
      {!map && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
