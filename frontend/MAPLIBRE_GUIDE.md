# MapLibre GL JS Integration Guide

This document explains how to use the new MapLibre GL JS components in the TropoScan application.

## Available Components

### 1. CycloneMapLibre (Recommended)
The primary map component optimized for cyclone visualization.

```tsx
import CycloneMapLibre from "@/components/CycloneMapLibre";

<CycloneMapLibre 
  locations={riskLocations}
  onLocationSelect={handleLocationSelect}
  selectedLocation={selectedLocation}
  center={[77.0, 20.0]}
  zoom={5}
  enableHeatmap={true}
  interactive={true}
  className="w-full h-full"
/>
```

**Props:**
- `locations`: Array of cyclone risk locations
- `onLocationSelect`: Callback when a location is clicked
- `selectedLocation`: Currently selected location
- `center`: Map center coordinates [lng, lat]
- `zoom`: Initial zoom level
- `enableHeatmap`: Show risk heatmap overlay
- `interactive`: Enable map controls and interactions
- `className`: CSS classes

### 2. ProfessionalMap
Advanced map with multiple style options and detailed popups.

```tsx
import ProfessionalMap from "@/components/ProfessionalMap";

<ProfessionalMap 
  locations={riskLocations}
  onLocationSelect={handleLocationSelect}
  selectedLocation={selectedLocation}
  showHeatmap={true}
  className="w-full h-full"
/>
```

### 3. MapLibreMap
Basic MapLibre implementation with markers.

```tsx
import MapLibreMap from "@/components/MapLibreMap";

<MapLibreMap 
  markers={markerData}
  onMarkerClick={handleMarkerClick}
  center={[77.0, 20.0]}
  zoom={5}
  className="w-full h-full"
/>
```

## Current Implementation

The TrendingPatterns page now uses a map switcher that cycles through:
1. **ProfessionalMap** (Default) - Full-featured MapLibre map with heatmap
2. **MapLibreMap** - Basic MapLibre implementation
3. **SimpleGoogleMap** - Leaflet-based fallback
4. **AlternativeMap** - SVG-based fallback

## Features

### MapLibre GL JS Benefits:
- ✅ No dependency on React Leaflet (eliminates render2 errors)
- ✅ Professional Google Maps-like appearance
- ✅ Hardware-accelerated rendering
- ✅ Multiple tile layer support (Street, Satellite, Terrain)
- ✅ Interactive controls (zoom, pan, fullscreen)
- ✅ Cyclone risk heatmap visualization
- ✅ Custom marker styling with popups
- ✅ Responsive design
- ✅ TypeScript support

### Map Styles Available:
1. **Street View** - OpenStreetMap tiles
2. **Satellite View** - Esri World Imagery
3. **Terrain View** - Esri Terrain tiles

### Cyclone Risk Features:
- Risk level color coding (Low: Green, Moderate: Orange, High: Red)
- Interactive heatmap showing risk density
- Detailed popups with risk scores, temperature, coverage
- Smooth animations and hover effects
- Legend showing risk level meanings

## Performance Optimizations

- Lazy loading of map tiles
- Efficient marker clustering for large datasets
- Optimized re-rendering with React callbacks
- Memory cleanup on component unmount
- Error boundary protection

## Browser Support

MapLibre GL JS supports:
- Chrome 65+
- Firefox 57+
- Safari 12+
- Edge 79+

## Migration from React Leaflet

The new MapLibre components replace the problematic React Leaflet implementation:

**Before (React Leaflet):**
```tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
// Error: render2 is not a function
```

**After (MapLibre GL JS):**
```tsx
import CycloneMapLibre from "@/components/CycloneMapLibre";
// Works reliably without React context issues
```

## Installation

MapLibre GL JS is already installed:
```bash
npm install maplibre-gl @types/maplibre-gl
```

## CSS Import

MapLibre CSS is imported in each component:
```tsx
import 'maplibre-gl/dist/maplibre-gl.css';
```

## Free Tile Sources

The implementation uses free tile sources:
- OpenStreetMap (no API key required)
- Esri World Imagery (free with attribution)
- Esri Terrain (free with attribution)

No Google Maps API key or paid services required.

## Troubleshooting

### Common Issues:
1. **Map not loading**: Check browser console for network errors
2. **Tiles not appearing**: Verify internet connection and tile URLs
3. **Performance issues**: Reduce marker count or disable heatmap
4. **TypeScript errors**: Ensure @types/maplibre-gl is installed

### Browser Console:
Check for MapLibre warnings (non-critical):
```
MapLibre GL warning: ...
```

These are typically safe to ignore and don't affect functionality.

## Future Enhancements

Planned improvements:
- Real-time cyclone data integration
- Weather overlay layers
- Cluster markers for better performance
- Custom map styles
- Offline map support
- Advanced filtering options
