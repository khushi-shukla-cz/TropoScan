import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface TrendData {
  date: string;
  riskScore: number;
  temperature: number;
  coverage: number;
  cycloneActivity: number;
}

interface TrendChartProps {
  data: TrendData[];
  isLoading: boolean;
  timeRange: '7d' | '30d' | '90d';
}

const TrendChart: React.FC<TrendChartProps> = ({ data, isLoading, timeRange }) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}${entry.name === 'Temperature' ? '°C' : entry.name === 'Coverage' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">No trend data available</p>
          <p className="text-gray-500 text-sm">Select a location to view trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Risk Score & Cyclone Activity Chart */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Risk Assessment Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#e5e7eb' }}
                iconType="line"
              />
              <Area
                type="monotone"
                dataKey="riskScore"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#riskGradient)"
                name="Risk Score"
              />
              <Area
                type="monotone"
                dataKey="cycloneActivity"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#activityGradient)"
                name="Cyclone Activity"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Temperature & Coverage Chart */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Environmental Conditions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <YAxis 
                yAxisId="temperature"
                orientation="left"
                stroke="#3b82f6"
                fontSize={12}
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#3b82f6' } }}
              />
              <YAxis 
                yAxisId="coverage"
                orientation="right"
                stroke="#10b981"
                fontSize={12}
                label={{ value: 'Coverage (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#10b981' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#e5e7eb' }}
                iconType="line"
              />
              <Line
                yAxisId="temperature"
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
                name="Temperature"
              />
              <Line
                yAxisId="coverage"
                type="monotone"
                dataKey="coverage"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6, fill: '#10b981' }}
                name="Coverage"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Average Risk */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <h4 className="text-gray-400 text-sm mb-2">Avg Risk Score</h4>
            <p className="text-white text-xl font-bold">
              {(data.reduce((acc, d) => acc + d.riskScore, 0) / data.length).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last {timeRange.replace('d', ' days')}
            </p>
          </CardContent>
        </Card>

        {/* Peak Activity */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <h4 className="text-gray-400 text-sm mb-2">Peak Activity</h4>
            <p className="text-white text-xl font-bold">
              {Math.max(...data.map(d => d.cycloneActivity)).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum recorded
            </p>
          </CardContent>
        </Card>

        {/* Temp Range */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <h4 className="text-gray-400 text-sm mb-2">Temp Range</h4>
            <p className="text-white text-xl font-bold">
              {(Math.max(...data.map(d => d.temperature)) - Math.min(...data.map(d => d.temperature))).toFixed(1)}°C
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Variation span
            </p>
          </CardContent>
        </Card>

        {/* Max Coverage */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <h4 className="text-gray-400 text-sm mb-2">Max Coverage</h4>
            <p className="text-white text-xl font-bold">
              {Math.max(...data.map(d => d.coverage)).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Peak cloud coverage
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendChart;
