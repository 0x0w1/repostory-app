import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleRepositoryTrendsClick = () => {
    navigate('/repository-trends');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-12">
          0x0w1
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={handleRepositoryTrendsClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Repository Trends
          </button>
          
          <div className="space-y-3">
            <button
              disabled
              className="bg-gray-300 text-gray-500 font-semibold py-3 px-8 rounded-lg cursor-not-allowed opacity-50 block w-full max-w-xs mx-auto"
            >
              Upcoming
            </button>
            
            <button
              disabled
              className="bg-gray-300 text-gray-500 font-semibold py-3 px-8 rounded-lg cursor-not-allowed opacity-50 block w-full max-w-xs mx-auto"
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;