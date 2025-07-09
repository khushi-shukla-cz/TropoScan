import React from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
} from "react-leaflet";

const TrajectoryForecast = () => {
  // Simulated dynamic coordinates (replace later with real model output)
  const forecastPath = [
    [18.5, 72.8],
    [19.0, 73.5],
    [19.5, 74.0],
    [20.1, 74.5],
    [21.0, 75.0],
  ];

  return (
    <div className="mt-8 text-white bg-white/10 p-6 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">
        🧭 Forecast Path (Next 24–120 hrs)
      </h2>
      <MapContainer
        center={[19, 73]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Polyline positions={forecastPath} color="orange" />
        {forecastPath.map((pos, i) => (
          <CircleMarker key={i} center={pos} radius={6} color="red">
            <Tooltip>+{i * 24} hrs</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TrajectoryForecast;
