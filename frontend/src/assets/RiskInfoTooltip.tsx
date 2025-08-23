import React from "react";

const RiskInfoTooltip = () => {
  return (
    <div className="relative inline-block group ml-2">
      <div className="w-5 h-5 bg-blue-500 text-white rounded-full text-xs text-center cursor-help">
        ?
      </div>
      <div className="absolute hidden group-hover:block bg-black text-white p-3 rounded shadow-lg w-64 text-sm z-10 mt-2 left-6">
        This map shows cloud cluster areas identified as high-risk. <br />
        AI highlights probable storm zones. Use it as early guidance, not final
        warning.
      </div>
    </div>
  );
};

export default RiskInfoTooltip;
