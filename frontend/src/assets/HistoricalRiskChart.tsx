import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "Nov 4", risk: 1 },
  { date: "Nov 5", risk: 2 },
  { date: "Nov 6", risk: 3 },
  { date: "Nov 7", risk: 4 },
];

const riskLabels = { 1: "Low", 2: "Moderate", 3: "High", 4: "Extreme" };

const HistoricalRiskChart = () => {
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4 text-white">
        📈 Historical Risk Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis
            domain={[1, 4]}
            tickFormatter={(v) => riskLabels[v]}
            stroke="#ccc"
          />
          <Tooltip formatter={(value) => riskLabels[value]} />
          <Legend />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalRiskChart;
