import React from "react";
import { formatNumber } from "../utils/dataLoader";

const RepositorySelector = ({
  repositoriesByCategory,
  selectedRepos,
  onRepoToggle,
  maxSelections = 5,
}) => {
  const handleToggle = (repo) => {
    const isSelected = selectedRepos.some(
      (selected) => selected.name === repo.name
    );

    if (isSelected) {
      onRepoToggle(
        selectedRepos.filter((selected) => selected.name !== repo.name)
      );
    } else if (selectedRepos.length < maxSelections) {
      onRepoToggle([...selectedRepos, repo]);
    }
  };

  const handleSelectAll = () => {
    const allRepos = Object.values(repositoriesByCategory).flat();
    const reposToSelect = allRepos.slice(0, maxSelections);
    onRepoToggle(reposToSelect);
  };

  const handleDeselectAll = () => {
    onRepoToggle([]);
  };

  const allReposCount = Object.values(repositoriesByCategory).flat().length;
  const canSelectAll = selectedRepos.length < Math.min(maxSelections, allReposCount);
  const hasSelections = selectedRepos.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Select Repositories
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {selectedRepos.length}/{maxSelections} selected
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleSelectAll}
          disabled={!canSelectAll}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            canSelectAll
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Select All ({Math.min(maxSelections, allReposCount)})
        </button>
        
        <button
          onClick={handleDeselectAll}
          disabled={!hasSelections}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            hasSelections
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Deselect All
        </button>
      </div>

      <div className="space-y-4 max-h-192 overflow-y-auto">
        {Object.entries(repositoriesByCategory).map(
          ([category, repositories]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 capitalize border-b pb-1">
                {category.replace(/-/g, " ")}
              </h4>
              {repositories.map((repo) => {
                const isSelected = selectedRepos.some(
                  (selected) => selected.name === repo.name
                );
                const canSelect =
                  selectedRepos.length < maxSelections || isSelected;

                return (
                  <div
                    key={repo.name}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-200"
                        : canSelect
                        ? "hover:bg-gray-50 border-gray-200"
                        : "opacity-50 cursor-not-allowed border-gray-200"
                    }`}
                    onClick={() => canSelect && handleToggle(repo)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      disabled={!canSelect}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{repo.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        ⭐ {formatNumber(repo.totalStars)} stars
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {selectedRepos.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Selected repositories:</p>
          <div className="flex flex-wrap gap-2">
            {selectedRepos.map((repo) => (
              <span
                key={repo.name}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {repo.name}
                <button
                  onClick={() => handleToggle(repo)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositorySelector;
