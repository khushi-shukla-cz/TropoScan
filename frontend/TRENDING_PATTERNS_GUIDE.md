# TropoScan Trending Patterns Feature

## Overview
The Trending Patterns page provides an interactive map-based interface for analyzing cyclone risk patterns across different geographical locations. Users can click on any location to view detailed trend analysis including historical risk scores, temperature patterns, cloud coverage, and cyclone activity.

## Features

### 🗺️ Interactive Map
- **Two Map Options**: 
  - Google Maps integration (requires API key)
  - Alternative SVG-based map (no API key required)
- **Risk Level Visualization**: Color-coded markers showing high (red), moderate (yellow), and low (green) risk levels
- **Real-time Data**: Displays current risk metrics for each location
- **Click to Explore**: Click any marker to view detailed location information

### 📊 Trend Analysis
- **Multi-timeframe Analysis**: View trends over 7 days, 30 days, or 90 days
- **Multiple Metrics**: 
  - Risk Score trends
  - Temperature variations
  - Cloud coverage patterns
  - Cyclone activity levels
- **Interactive Charts**: Built with Recharts for responsive, interactive visualizations
- **Export Functionality**: Download trend data as CSV files

### 📍 Location Search
- **SerpAPI Integration**: Search for weather stations and monitoring centers
- **Predefined Locations**: Quick access to major meteorological centers
- **Reverse Geocoding**: Get location names from coordinates

## Using the Feature

### 1. Navigation
- From the main dashboard, click the "Trends" button in the navigation bar
- Or visit `/trending` directly

### 2. Map Interaction
- **View Risk Hotspots**: The sidebar shows current high-risk locations sorted by risk score
- **Click Markers**: Click any map marker to select a location
- **Switch Map Types**: Toggle between Google Maps and Alternative Map using the button in the header

### 3. Location Analysis
Once a location is selected:
- **Current Metrics**: View real-time risk score, temperature, coverage, and confidence
- **Trend Charts**: Analyze historical patterns with interactive charts
- **Time Range Selection**: Choose 7d, 30d, or 90d for different analysis periods
- **Export Data**: Download CSV files of trend data for further analysis

### 4. Search Functionality
- **Location Search**: Use the search bar to find specific locations
- **Find Monitors**: Quick search for cyclone monitoring stations
- **Weather Stations**: Locate meteorological offices and observatories

## Technical Implementation

### Map Services
```typescript
// Using SerpAPI for location search
const mapService = new MapService(SERP_API_KEY);
const results = await mapService.searchLocations('weather station India');

// Calculate distances between locations
const distance = locationUtils.calculateDistance(lat1, lng1, lat2, lng2);
```

### Real-time Data Integration
The feature integrates with the backend AI model to provide:
- **Live Risk Scores**: Calculated using the PyTorch U-Net model
- **Temperature Data**: From INSAT satellite imagery
- **Coverage Analysis**: Pixel-level cloud coverage detection
- **Confidence Metrics**: Model prediction confidence scores

### Chart Components
Interactive charts show:
- **Risk Assessment Trends**: Area charts showing risk score and cyclone activity
- **Environmental Conditions**: Line charts for temperature and coverage
- **Summary Statistics**: Key metrics for the selected time period

## API Integration

### SerpAPI Setup
To use real location search with SerpAPI:

1. **Get API Key**: Sign up at [SerpAPI](https://serpapi.com)
2. **Set Environment Variable**: 
   ```bash
   REACT_APP_SERP_API_KEY=your_serp_api_key_here
   ```
3. **Example API Call**:
   ```
   https://serpapi.com/search.json?engine=google_maps&q=weather%20station&ll=@20.5937,78.9629,10z&api_key=YOUR_KEY
   ```

### Google Maps Setup
For Google Maps integration:

1. **Enable APIs**: Google Maps JavaScript API and Places API
2. **Set API Key**: Replace `YOUR_GOOGLE_MAPS_API_KEY` in `InteractiveMap.tsx`
3. **Configure Restrictions**: Set domain restrictions for security

## Data Flow

```
User Interaction → Location Selection → Backend API Call → 
AI Model Processing → Risk Calculation → Trend Generation → 
Chart Visualization → Export Option
```

## Performance Features

- **Lazy Loading**: Components load on-demand
- **Caching**: Location data cached for better performance
- **Debounced Search**: Optimized search input handling
- **Background Processing**: Non-blocking data fetching

## Customization

### Adding New Locations
```typescript
const customLocation: LocationData = {
  lat: 25.2744,
  lng: 133.7751,
  name: "Custom Station",
  riskScore: 45,
  temperature: -65.2,
  coverage: 15.8,
  confidence: 78,
  riskLevel: "moderate",
  lastUpdated: new Date().toISOString()
};
```

### Custom Risk Calculations
The trend generation can be customized to use different algorithms:
```typescript
const generateCustomTrends = (location: LocationData, days: number) => {
  // Custom trend calculation logic
  return trendData;
};
```

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Responsive**: Optimized for tablets and mobile devices
- **Progressive Enhancement**: Fallbacks for unsupported features

## Security Considerations
- **API Key Protection**: Environment variables for sensitive keys
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Sanitized search inputs and coordinates

## Future Enhancements
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Machine learning trend predictions
- **Collaborative Features**: Multi-user location sharing
- **Enhanced Export**: PDF reports and advanced data formats

## Troubleshooting

### Common Issues
1. **Map not loading**: Check API keys and network connectivity
2. **No trend data**: Verify backend API is running
3. **Search not working**: Confirm SerpAPI key is set correctly
4. **Charts not rendering**: Ensure Recharts is properly installed

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('TROPOSCAN_DEBUG', 'true');
```

## Support
For technical support or feature requests, please refer to the main TropoScan documentation or contact the development team.
