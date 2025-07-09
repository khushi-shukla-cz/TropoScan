import React from "react";

const EvacuationAlert = ({ risk }) => {
  const isCritical = risk.toLowerCase() === "high";
  return isCritical ? (
    <div className="mt-6 p-4 bg-red-700 text-white rounded shadow-lg animate-pulse">
      🚨 Immediate Evacuation Recommended in Impact Areas!
    </div>
  ) : null;
};

export default EvacuationAlert;