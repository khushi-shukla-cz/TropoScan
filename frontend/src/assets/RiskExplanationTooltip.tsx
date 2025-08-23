
import React from "react";

const RiskExplanationTooltip = () => {
  return (
    <div className="text-sm text-gray-300 mt-4 max-w-xl bg-black/30 p-4 rounded-lg border border-white/10">
      💡 <strong>Why is this risky?</strong><br />
      AI detects dense, cold cloud clusters (shown in red) that form in spiral patterns — a key sign of developing cyclones.<br />
      High risk means there's strong convection, central organization, and high pixel coverage in dangerous zones.
    </div>
  );
};

export default RiskExplanationTooltip;
