import React from 'react';

const MetricSelector = ({ selectedMetric, onMetricChange }) => {
  const metrics = [
    { value: 'stars', label: 'Stars', icon: '⭐' },
    { value: 'forks', label: 'Forks', icon: '🔀' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Metric</h3>
      <div className="flex space-x-4">
        {metrics.map((metric) => (
          <button
            key={metric.value}
            onClick={() => onMetricChange(metric.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              selectedMetric === metric.value
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
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