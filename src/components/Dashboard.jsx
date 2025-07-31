import React, { useState, useEffect, useMemo, useCallback } from "react";
import Chart from "./Chart";
import RepositorySelector from "./RepositorySelector";
import MetricSelector from "./MetricSelector";
import DateRangeSelector from "./DateRangeSelector";
import {
  loadRepositoryData,
  processTimeSeriesData,
  refreshRepositoryData,
} from "../utils/dataLoader";

const Dashboard = () => {
  const [repositoriesByCategory, setRepositoriesByCategory] = useState({});
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [hiddenRepos, setHiddenRepos] = useState(new Set());
  const [selectedMetric, setSelectedMetric] = useState("stars");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    return fiveYearsAgo.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const reposByCategory = await loadRepositoryData();
        setRepositoriesByCategory(reposByCategory);

        const allRepos = Object.values(reposByCategory).flat();
        if (allRepos.length > 0) {
          setSelectedRepos([allRepos[0]]);
        }
      } catch (err) {
        setError("Failed to load repository data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const handleRepoVisibilityToggle = (repoName) => {
    setHiddenRepos((prev) => {
      const newHidden = new Set(prev);
      if (newHidden.has(repoName)) {
        newHidden.delete(repoName);
      } else {
        newHidden.add(repoName);
      }
      return newHidden;
    });
  };

  // Debounce function to prevent rapid chart updates
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Store processed data and final chart data separately
  const [processedRepoData, setProcessedRepoData] = useState({});
  const [chartData, setChartData] = useState([]);

  // Process repository data asynchronously
  const processRepositoryData = useCallback(
    async (repos) => {
      if (repos.length === 0) {
        setProcessedRepoData({});
        setChartData([]);
        return;
      }

      setChartLoading(true);

      // Use setTimeout to make the processing non-blocking
      setTimeout(async () => {
        try {
          const processed = {};

          // Process each repository
          for (const repo of repos) {
            const timeSeriesData = processTimeSeriesData(
              repo.starsByDate,
              repo.forksByDate
            );

            // Create date-indexed map for O(1) lookup
            const dateMap = new Map();
            timeSeriesData.forEach((point) => {
              dateMap.set(point.date, point);
            });

            processed[repo.name] = {
              data: timeSeriesData,
              dateMap: dateMap,
            };
          }

          setProcessedRepoData(processed);

          // Generate chart data
          const allDatesSet = new Set();
          Object.values(processed).forEach(({ data }) => {
            data.forEach((point) => allDatesSet.add(point.date));
          });

          const sortedDates = Array.from(allDatesSet).sort();

          // Apply date filtering - if no start date, show all data
          const filteredDates = sortedDates.filter(date => {
            if (startDate && startDate.trim() && date < startDate) return false;
            if (endDate && endDate.trim() && date > endDate) return false;
            return true;
          });

          const newChartData = filteredDates.map((date) => {
            const point = { date };

            repos.forEach((repo) => {
              const { dateMap, data } = processed[repo.name];
              const dataPoint = dateMap.get(date);

              if (dataPoint) {
                point[repo.name] =
                  selectedMetric === "stars"
                    ? dataPoint.stars
                    : dataPoint.forks;
              } else {
                // Use binary search for better performance
                let lastValue = 0;
                let left = 0;
                let right = data.length - 1;
                let bestIndex = -1;

                while (left <= right) {
                  const mid = Math.floor((left + right) / 2);
                  if (data[mid].date < date) {
                    bestIndex = mid;
                    left = mid + 1;
                  } else {
                    right = mid - 1;
                  }
                }

                if (bestIndex !== -1) {
                  lastValue =
                    selectedMetric === "stars"
                      ? data[bestIndex].stars
                      : data[bestIndex].forks;
                }
                point[repo.name] = lastValue;
              }
            });

            return point;
          });

          setChartData(newChartData);
        } catch (error) {
          console.error("Error processing chart data:", error);
        } finally {
          setChartLoading(false);
        }
      }, 10);
    },
    [selectedMetric, startDate, endDate]
  );

  // Update chart data when metric changes (fast operation)
  const updateChartDataForMetric = useCallback(
    (newMetric, currentProcessedData = processedRepoData) => {
      if (Object.keys(currentProcessedData).length === 0) return;

      setChartData((prevData) =>
        prevData.map((point) => {
          const newPoint = { date: point.date };

          selectedRepos.forEach((repo) => {
            const repoData = currentProcessedData[repo.name];
            if (!repoData) {
              newPoint[repo.name] = 0;
              return;
            }

            const { dateMap, data } = repoData;
            const dataPoint = dateMap.get(point.date);

            if (dataPoint) {
              newPoint[repo.name] =
                newMetric === "stars" ? dataPoint.stars : dataPoint.forks;
            } else {
              // Find last valid value
              let lastValue = 0;
              for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].date < point.date) {
                  lastValue =
                    newMetric === "stars" ? data[i].stars : data[i].forks;
                  break;
                }
              }
              newPoint[repo.name] = lastValue;
            }
          });

          return newPoint;
        })
      );
    },
    [selectedRepos]
  );

  // Debounced chart data processing
  const debouncedProcessData = useMemo(
    () => debounce(processRepositoryData, 300),
    [debounce, processRepositoryData]
  );

  // Effect for repository changes
  useEffect(() => {
    debouncedProcessData(selectedRepos);
  }, [selectedRepos, debouncedProcessData]);

  // Effect for metric changes (immediate update)
  useEffect(() => {
    if (Object.keys(processedRepoData).length > 0 && chartData.length > 0) {
      updateChartDataForMetric(selectedMetric, processedRepoData);
    }
  }, [selectedMetric]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading repository data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Repository Stars/Forks History Dashboard
          </h1>
          <p className="text-gray-600">
            Track and compare GitHub stars and forks.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart section - appears first on mobile */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <div className="lg:hidden mb-6 space-y-6">
              <MetricSelector
                selectedMetric={selectedMetric}
                onMetricChange={setSelectedMetric}
              />
              
              <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Repository Trends
              </h2>
            </div>

            {chartLoading ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedMetric === "stars" ? "Stars" : "Forks"} Over Time
                </h3>
                <div className="flex items-center justify-center" style={{ height: isMobile ? '400px' : '676px' }}>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing chart data...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedRepos.length} repositories selected
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Chart
                data={chartData}
                metric={selectedMetric}
                selectedRepos={selectedRepos}
                hiddenRepos={hiddenRepos}
                onRepoVisibilityToggle={handleRepoVisibilityToggle}
              />
            )}

            {selectedRepos.length > 0 && (
              <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Repository Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedRepos.map((repo) => (
                    <div key={repo.name} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {repo.name}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>⭐ {repo.totalStars.toLocaleString()} stars</p>
                        <p>
                          🔀{" "}
                          {Object.values(repo.forksByDate)
                            .reduce((sum, forks) => sum + forks, 0)
                            .toLocaleString()}{" "}
                          forks
                        </p>
                        <p className="text-xs">
                          Updated:{" "}
                          {new Date(repo.fetchedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selector section - appears second on mobile, sidebar on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-1 space-y-6">
            <div className="hidden lg:block">
              <MetricSelector
                selectedMetric={selectedMetric}
                onMetricChange={setSelectedMetric}
              />
            </div>

            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            <RepositorySelector
              repositoriesByCategory={repositoriesByCategory}
              selectedRepos={selectedRepos}
              onRepoToggle={setSelectedRepos}
              maxSelections={15}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
