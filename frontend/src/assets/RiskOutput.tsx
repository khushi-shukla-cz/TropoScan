import React from "react";
import TrajectoryForecast from "../components/TrajectoryForecast";
import HistoricalComparison from "../components/HistoricalComparison";
import RateChange from "../components/RateChange";
import WeatherStationOverlay from "../components/WeatherStationOverlay";
import EvacuationAlert from "../components/EvacuationAlert";
import RiskInfoTooltip from "../components/RiskInfoTooltip";
import EmergencyInfo from "./EmergencyInfo";

interface RiskResult {
  risk: string;
  coverage: number;
  temperature: number;
  cluster_area: number;
  confidence: number;
  explanation: string;
  input_url: string;
  overlay_url: string;
}

const RiskOutput = ({ result }: { result: RiskResult }) => {
  if (!result) {
    return (
      <div className="text-white text-center mt-6">
        <p>No result available. Please upload an image to get started.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white/10 rounded-lg text-white max-w-6xl mx-auto shadow-xl animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-center">
        🧠 Risk Assessment Summary
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 text-left text-lg">
        <p>
          🌪️ <strong>Risk Level:</strong> {result.risk}
        </p>
        <p>
          ☁️ <strong>Cloud Coverage:</strong> {result.coverage?.toFixed(2)}%
        </p>
        <p>
          🌡️ <strong>Estimated Temp:</strong> {result.temperature}°C
        </p>
        <p>
          📏 <strong>Cluster Area:</strong> {result.cluster_area} km²
        </p>
        <p>
          🔍 <strong>Confidence:</strong> {result.confidence}%
        </p>
      </div>
      <div className="mt-6">
        <p className="italic text-sm bg-black/30 p-4 rounded border border-white/10">
          💡 {result.explanation}
        </p>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">🛰️ Original Satellite Image</h3>
          <img
            src={`http://localhost:5000${result.input_url}`}
            alt="Input satellite"
            className="rounded shadow-lg border border-white/10"
          />
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center"> AI Overlay </h3>
          <img
            src={`http://localhost:5000${result.overlay_url}`}
            alt="Overlay mask"
            className="rounded shadow-lg border border-white/10"
          />
        </div>
      </div>
      <div className="mt-10 space-y-6">
        <EvacuationAlert risk={result.risk} />
        <RiskInfoTooltip />
        <TrajectoryForecast />

        <RateChange result={result} />
        <HistoricalComparison result={result} />

        <WeatherStationOverlay />
      </div>
    </div>
  );
};

export default RiskOutput;
