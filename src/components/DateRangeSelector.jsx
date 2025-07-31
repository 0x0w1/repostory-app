import React from "react";

const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // yyyy-MM-dd format
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    onStartDateChange(value);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    onEndDateChange(value);
  };

  const handleReset = () => {
    onStartDateChange("");
    onEndDateChange("");
  };

  const handleClearStart = () => {
    onStartDateChange("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Date Range</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            {startDate && (
              <button
                onClick={handleClearStart}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear (show all)
              </button>
            )}
          </div>
          <input
            type="date"
            id="start-date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            min={formatDateForInput(startDate)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;