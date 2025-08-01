import React from "react";
import { formatNumber } from "../utils/dataLoader";

const RepositorySelector = ({
  repositoriesByCategory,
  selectedRepos,
  onRepoToggle,
  maxSelections = null,
}) => {
  const handleToggle = (repo) => {
    const isSelected = selectedRepos.some(
      (selected) => selected.name === repo.name
    );

    let newRepos;
    if (isSelected) {
      newRepos = selectedRepos.filter((selected) => selected.name !== repo.name);
    } else if (!maxSelections || selectedRepos.length < maxSelections) {
      newRepos = [...selectedRepos, repo];
    } else {
      return; // Don't trigger update if at max limit
    }

    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      onRepoToggle(newRepos);
    });
  };

  const handleSelectAll = () => {
    const allRepos = Object.values(repositoriesByCategory).flat();
    const reposToSelect = maxSelections ? allRepos.slice(0, maxSelections) : allRepos;
    requestAnimationFrame(() => {
      onRepoToggle(reposToSelect);
    });
  };

  const handleDeselectAll = () => {
    requestAnimationFrame(() => {
      onRepoToggle([]);
    });
  };

  const allReposCount = Object.values(repositoriesByCategory).flat().length;
  const canSelectAll = maxSelections 
    ? selectedRepos.length < Math.min(maxSelections, allReposCount)
    : selectedRepos.length < allReposCount;
  const hasSelections = selectedRepos.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Repositories
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedRepos.length}{maxSelections ? `/${maxSelections}` : ''} selected
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
              : "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          Select All ({maxSelections ? Math.min(maxSelections, allReposCount) : allReposCount})
        </button>

        <button
          onClick={handleDeselectAll}
          disabled={!hasSelections}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            hasSelections
              ? "bg-gray-600 dark:bg-gray-500 text-white hover:bg-gray-700 dark:hover:bg-gray-400"
              : "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          Deselect All
        </button>
      </div>

      <div className="space-y-4 max-h-192 overflow-y-auto">
        {Object.entries(repositoriesByCategory).map(
          ([category, repositories]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize border-b border-gray-200 dark:border-gray-600 pb-1">
                {category.replace(/-/g, " ")}
              </h4>
              {repositories.map((repo) => {
                const isSelected = selectedRepos.some(
                  (selected) => selected.name === repo.name
                );
                const canSelect =
                  !maxSelections || selectedRepos.length < maxSelections || isSelected;

                return (
                  <div
                    key={repo.name}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                        : canSelect
                        ? "hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                        : "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => canSelect && handleToggle(repo)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500 mr-3"
                      disabled={!canSelect}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {repo.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected repositories:</p>
          <div className="flex flex-wrap gap-2">
            {selectedRepos.map((repo) => (
              <span
                key={repo.name}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
              >
                {repo.name}
                <button
                  onClick={() => handleToggle(repo)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
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
