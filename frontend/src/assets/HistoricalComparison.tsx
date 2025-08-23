import React from "react";

const HistoricalComparison = ({ result }: { result: any }) => {
  const famousStorms = [
    {
      name: "Cyclone Fani (2019)",
      coverage: 88.4,
      temp: 25.3,
      area: 130000,
    },
    {
      name: "Cyclone Amphan (2020)",
      coverage: 91.1,
      temp: 24.7,
      area: 110000,
    },
    {
      name: "Cyclone Biparjoy (2023)",
      coverage: 83.6,
      temp: 26.2,
      area: 105000,
    },
  ];

  return (
    <div className="mt-8 bg-white/10 text-white p-6 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">📊 Cyclone Comparison</h2>

      <div className="mb-4">
        <p>
          <strong>🧠 Detected Risk:</strong> {result.risk}
        </p>
        <p>
          <strong>☁️ Cloud Coverage:</strong> {result.coverage?.toFixed(1)}%
        </p>
        <p>
          <strong>📏 Cluster Area:</strong>{" "}
          {result.cluster_area?.toLocaleString()} km²
        </p>
        <p>
          <strong>🌡️ Temperature:</strong> {result.temperature}°C
        </p>
      </div>
      <p className="mb-2 italic text-sm text-gray-300">
        Compared against famous cyclones:
      </p>
      <ul className="space-y-3">
        {famousStorms.map((storm, i) => (
          <li key={i} className="bg-black/30 p-4 rounded">
            <strong>{storm.name}</strong>
            <p>☁️ Coverage: {storm.coverage}%</p>
            <p>📏 Area: {storm.area.toLocaleString()} km²</p>
            <p>🌡️ Temp: {storm.temp}°C</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoricalComparison;
