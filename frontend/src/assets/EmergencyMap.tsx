import React, { useRef, useEffect } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const emergencyLocations = [
  {
    name: "Relief Center A",
    lat: 19.076,
    lng: 72.8777,
    type: "Shelter",
    icon: "🏠"
  },
  {
    name: "District Hospital", 
    lat: 19.0845,
    lng: 72.8936,
    type: "Medical",
    icon: "🏥"
  },
  {
    name: "Fire Station",
    lat: 19.0728,
    lng: 72.8826,
    type: "Emergency",
    icon: "🚒"
  },
  {
    name: "Police Station",
    lat: 19.0825,
    lng: 72.8808,
    type: "Security", 
    icon: "🚔"
  }
];

const EmergencyMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
      center: [72.8777, 19.076], // Mumbai coordinates
      zoom: 12
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add markers for emergency locations
    emergencyLocations.forEach((location) => {
      const el = document.createElement('div');
      el.innerHTML = location.icon;
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';
      el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; text-align: center;">
          <strong>${location.name}</strong><br/>
          <span style="color: #666;">${location.type}</span><br/>
          <small>${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E</small>
        </div>
      `);

      new maplibregl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: "400px", 
        width: "100%", 
        borderRadius: "12px",
        overflow: "hidden"
      }} 
    />
  );
};

export default EmergencyMap;
