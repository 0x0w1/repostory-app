import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatDate, formatNumber } from "../utils/dataLoader";

const Chart = ({
  data,
  metric,
  selectedRepos,
  hiddenRepos,
  onRepoVisibilityToggle,
}) => {
  const [chartHeight, setChartHeight] = useState(676);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const mobile = window.innerWidth < 1024;
      setChartHeight(mobile ? 400 : 676);
      setIsMobile(mobile);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const colors = useMemo(() => [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
    "#ec4899",
    "#6366f1",
  ], []);

  const CustomTooltip = useMemo(() => ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  const formatXAxisLabel = useMemo(() => (tickItem) => {
    const date = new Date(tickItem);
    return date.getFullYear().toString();
  }, []);

  const CustomLegend = useMemo(() => (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry, index) => {
          const isHidden = hiddenRepos.has(entry.dataKey);
          return (
            <div
              key={entry.dataKey}
              className={`flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors ${
                isHidden ? "opacity-50" : ""
              }`}
              onClick={() => onRepoVisibilityToggle(entry.dataKey)}
            >
              <div
                className="w-3 h-3 mr-2"
                style={{
                  backgroundColor: isHidden ? "#d1d5db" : entry.color,
                  transition: "background-color 0.2s",
                }}
              />
              <span
                className={`text-sm ${
                  isHidden ? "line-through text-gray-500" : "text-gray-700"
                }`}
              >
                {entry.dataKey}
              </span>
            </div>
          );
        })}
      </div>
    );
  }, [hiddenRepos, onRepoVisibilityToggle]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height: `${chartHeight}px` }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {metric === "stars" ? "Stars" : "Forks"} Over Time
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={data}
          margin={{ 
            top: 5, 
            right: 30, 
            left: isMobile ? 5 : 20, 
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fontSize: 12 }}
            stroke="#666"
            width={isMobile ? 40 : 60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {selectedRepos.map((repo, index) => {
            const isHidden = hiddenRepos.has(repo.name);
            return (
              <Line
                key={repo.name}
                type="monotone"
                dataKey={repo.name}
                stroke={
                  isHidden ? "transparent" : colors[index % colors.length]
                }
                strokeWidth={2}
                dot={false}
                activeDot={{ r: isHidden ? 0 : 4 }}
                hide={isHidden}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(Chart);
