import React from "react";

const MetricSelector = ({ selectedMetric, onMetricChange }) => {
  const metrics = [
    { value: "stars", label: "Stars", icon: "⭐" },
    { value: "forks", label: "Forks", icon: "🔀" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metric</h3>
      <div className="flex space-x-4">
        {metrics.map((metric) => (
          <button
            key={metric.value}
            onClick={() => onMetricChange(metric.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              selectedMetric === metric.value
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            <span>{metric.icon}</span>
            <span className="font-medium">{metric.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MetricSelector;
