import React from "react";

const WeatherStationOverlay = () => {
  const stations = [
    { name: "Mumbai", temp: 29.5, humidity: 78 },
    { name: "Goa", temp: 28.2, humidity: 82 }
  ];
  return (
    <div className="mt-8 p-4 bg-white/10 text-white rounded-lg">
      <h3 className="text-xl font-bold mb-2">🌦️ Live Weather Station Data</h3>
      <ul className="space-y-2">
        {stations.map((s, i) => (
          <li key={i}>
            <strong>{s.name}</strong>: {s.temp}°C, Humidity: {s.humidity}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherStationOverlay;