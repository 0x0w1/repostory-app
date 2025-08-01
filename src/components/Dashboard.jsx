import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "./Chart";
import RepositorySelector from "./RepositorySelector";
import MetricSelector from "./MetricSelector";
import DateRangeSelector from "./DateRangeSelector";
import ThemeToggle from "./ThemeToggle";
import ConsentManager from "./ConsentManager";
import {
  loadRepositoryData,
  processTimeSeriesData,
  refreshRepositoryData,
} from "../utils/dataLoader";

const Dashboard = () => {
  const navigate = useNavigate();
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
    return fiveYearsAgo.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  // Process repository data and generate chart data
  const processRepositoryData = useCallback(
    (repos, currentMetric) => {
      // Use selectedMetric as fallback if currentMetric is not provided
      const metric = currentMetric || selectedMetric;
      if (repos.length === 0) {
        setProcessedRepoData({});
        setChartData([]);
        return;
      }

      // Don't show loading state for repo selection changes
      setChartLoading((prev) => {
        // Only show loading if there's no existing processed data
        return Object.keys(processedRepoData).length === 0;
      });

      try {
        const processed = {};

        // Process each repository
        for (const repo of repos) {
          if (!repo || !repo.name) {
            console.warn('Invalid repository object:', repo);
            continue;
          }

          const timeSeriesData = processTimeSeriesData(
            repo.starsByDate || {},
            repo.forksByDate || {}
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

        // Generate chart data with current metric inline to avoid dependency issues
        if (Object.keys(processed).length === 0 || repos.length === 0) {
          setChartData([]);
          return;
        }

        // Generate chart data
        const allDatesSet = new Set();
        Object.values(processed).forEach(({ data }) => {
          if (data && Array.isArray(data)) {
            data.forEach((point) => allDatesSet.add(point.date));
          }
        });

        const sortedDates = Array.from(allDatesSet).sort();

        // Apply date filtering
        const filteredDates = sortedDates.filter((date) => {
          if (startDate && startDate.trim() && date < startDate) return false;
          if (endDate && endDate.trim() && date > endDate) return false;
          return true;
        });

        const newChartData = filteredDates.map((date) => {
          const point = { date };

          repos.forEach((repo) => {
            const processedRepo = processed[repo.name];
            if (!processedRepo) {
              console.warn(`No processed data found for repository: ${repo.name}`);
              point[repo.name] = 0;
              return;
            }

            const { dateMap, data } = processedRepo;
            const dataPoint = dateMap.get(date);

            if (dataPoint) {
              point[repo.name] =
                metric === "stars" ? dataPoint.stars : dataPoint.forks;
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
                  metric === "stars" ? data[bestIndex].stars : data[bestIndex].forks;
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
    },
    [startDate, endDate, selectedMetric]
  );

  // Update chart data when only metric changes (reuse existing processed data)
  const updateChartForMetricChange = useCallback(() => {
    if (!processedRepoData || Object.keys(processedRepoData).length === 0 || !selectedRepos || selectedRepos.length === 0) {
      return;
    }

    setChartData((prevChartData) => {
      return prevChartData.map((point) => {
        const newPoint = { date: point.date };

        selectedRepos.forEach((repo) => {
          const processedRepo = processedRepoData[repo.name];
          if (!processedRepo) {
            newPoint[repo.name] = 0;
            return;
          }

          const { dateMap, data } = processedRepo;
          const dataPoint = dateMap.get(point.date);

          if (dataPoint) {
            newPoint[repo.name] =
              selectedMetric === "stars" ? dataPoint.stars : dataPoint.forks;
          } else {
            // Use binary search to find the last available value before this date
            let lastValue = 0;
            let left = 0;
            let right = data.length - 1;
            let bestIndex = -1;

            while (left <= right) {
              const mid = Math.floor((left + right) / 2);
              if (data[mid].date < point.date) {
                bestIndex = mid;
                left = mid + 1;
              } else {
                right = mid - 1;
              }
            }

            if (bestIndex !== -1) {
              lastValue =
                selectedMetric === "stars" ? data[bestIndex].stars : data[bestIndex].forks;
            }
            newPoint[repo.name] = lastValue;
          }
        });

        return newPoint;
      });
    });
  }, [selectedMetric]);


  // Create a stable debounced function that always uses current metric
  const debouncedProcessData = useMemo(
    () => debounce((repos, metric) => processRepositoryData(repos, metric), 50),
    [processRepositoryData]
  );

  // Effect for repository changes
  useEffect(() => {
    // For single repository changes, update immediately
    if (selectedRepos.length <= 5) {
      processRepositoryData(selectedRepos, selectedMetric);
    } else {
      // For bulk changes, use debounce with current metric
      debouncedProcessData(selectedRepos, selectedMetric);
    }
  }, [selectedRepos, selectedMetric, debouncedProcessData]);

  // Effect for metric changes (immediate update)
  useEffect(() => {
    updateChartForMetricChange();
  }, [updateChartForMetricChange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-[300px]">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading repository data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-[300px]">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <div className="text-destructive text-xl">⚠️</div>
            <p className="text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Repository Stars/Forks History Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track and compare GitHub stars and forks.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Chart section - first on mobile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Repository Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <div
                  className="flex items-center justify-center"
                  style={{ height: "400px" }}
                >
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <div>
                      <p className="text-muted-foreground">Processing chart data...</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedRepos.length} repositories selected
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Chart
                  key={`${selectedMetric}-${selectedRepos.map(r => r.name).join('-')}`}
                  data={chartData}
                  metric={selectedMetric}
                  selectedRepos={selectedRepos}
                  hiddenRepos={hiddenRepos}
                  onRepoVisibilityToggle={handleRepoVisibilityToggle}
                />
              )}
            </CardContent>
          </Card>

          {/* Date Range section - second on mobile */}
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          {/* Metric selector - third on mobile */}
          <MetricSelector
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />

          {/* Repository selector - fourth on mobile */}
          <RepositorySelector
            repositoriesByCategory={repositoriesByCategory}
            selectedRepos={selectedRepos}
            onRepoToggle={setSelectedRepos}
          />

        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {/* Chart section - main content area on desktop */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Repository Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div
                    className="flex items-center justify-center"
                    style={{ height: "676px" }}
                  >
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <div>
                        <p className="text-muted-foreground">Processing chart data...</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedRepos.length} repositories selected
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Chart
                    key={`${selectedMetric}-${selectedRepos.map(r => r.name).join('-')}`}
                    data={chartData}
                    metric={selectedMetric}
                    selectedRepos={selectedRepos}
                    hiddenRepos={hiddenRepos}
                    onRepoVisibilityToggle={handleRepoVisibilityToggle}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar section - control panel on desktop */}
          <div className="lg:col-span-1 space-y-6">
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

            <RepositorySelector
              repositoriesByCategory={repositoriesByCategory}
              selectedRepos={selectedRepos}
              onRepoToggle={setSelectedRepos}
            />
          </div>
        </div>
      </div>
      
      {/* Google AdSense CMP Consent Manager */}
      <ConsentManager />
    </div>
  );
};

export default Dashboard;
