import React from "react";

const RateChange = ({ result }: { result: any }) => {
  const change = result.coverage_change || 4.2; // mock for now

  return (
    <div className="mt-8 bg-white/10 text-white p-6 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">📈 Rate of Intensification</h2>
      <p>
        The cloud coverage has changed by <strong>{change.toFixed(1)}%</strong>{" "}
        in the last 30 minutes.
      </p>
      <p className="text-sm text-gray-300 mt-2">
        Rapid intensification can indicate developing storms. A change over 5%
        per 30 min is significant.
      </p>
    </div>
  );
};

export default RateChange;
