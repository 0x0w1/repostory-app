import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNumber, processTimeSeriesData } from "../utils/dataLoader";

const CategoryChart = ({ repositories, metric, startDate, endDate, categoryName }) => {
  const chartData = useMemo(() => {
    if (!repositories || repositories.length === 0) return [];

    const colors = ["#3b82f6", "#ef4444", "#10b981"];
    const processedData = {};

    // Process each repository's time series data
    repositories.forEach((repo) => {
      const timeSeriesData = processTimeSeriesData(
        repo.starsByDate || {},
        repo.forksByDate || {},
        repo.issuesByDate || {},
        repo.pullRequestsByDate || {}
      );
      
      const dateMap = new Map();
      timeSeriesData.forEach((point) => {
        dateMap.set(point.date, point);
      });
      
      processedData[repo.name] = { data: timeSeriesData, dateMap };
    });

    // Get all dates and apply filtering
    const allDatesSet = new Set();
    Object.values(processedData).forEach(({ data }) => {
      if (data && Array.isArray(data)) {
        data.forEach((point) => allDatesSet.add(point.date));
      }
    });

    const sortedDates = Array.from(allDatesSet).sort();
    const filteredDates = sortedDates.filter((date) => {
      if (startDate && startDate.trim() && date < startDate) return false;
      if (endDate && endDate.trim() && date > endDate) return false;
      return true;
    });

    // Generate chart data
    const chartPoints = filteredDates.map((date) => {
      const point = { date };

      repositories.forEach((repo) => {
        const processedRepo = processedData[repo.name];
        if (!processedRepo) {
          point[repo.name] = 0;
          return;
        }

        const { dateMap, data } = processedRepo;
        const dataPoint = dateMap.get(date);

        if (dataPoint) {
          let value = 0;
          switch (metric) {
            case "stars":
              value = dataPoint.stars;
              break;
            case "forks":
              value = dataPoint.forks;
              break;
            case "issues":
              value = dataPoint.issues;
              break;
            case "pullRequests":
              value = dataPoint.pullRequests;
              break;
            default:
              value = dataPoint.stars;
          }
          point[repo.name] = value;
        } else {
          // Binary search for last available value
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
            switch (metric) {
              case "stars":
                lastValue = data[bestIndex].stars;
                break;
              case "forks":
                lastValue = data[bestIndex].forks;
                break;
              case "issues":
                lastValue = data[bestIndex].issues;
                break;
              case "pullRequests":
                lastValue = data[bestIndex].pullRequests;
                break;
              default:
                lastValue = data[bestIndex].stars;
            }
          }
          point[repo.name] = lastValue;
        }
      });

      return point;
    });

    return chartPoints;
  }, [repositories, metric, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 shadow-lg">
          <p className="font-medium text-foreground">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {entry.dataKey}: {formatNumber(entry.value)}
            </p>
          ))}
        </Card>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem) => {
    const date = new Date(tickItem);
    return date.getFullYear().toString();
  };

  const colors = ["#3b82f6", "#ef4444", "#10b981"];

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg capitalize">
            {categoryName.replace(/python-/g, '').replace(/-/g, ' ')} - Top 3
          </CardTitle>
        </CardHeader>
        <CardContent 
          className="flex items-center justify-center"
          style={{ height: "300px" }}
        >
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg capitalize">
          {categoryName.replace(/python-/g, '').replace(/-/g, ' ')} - Top 3
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 5,
            }}
            isAnimationActive={false}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisLabel}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              stroke="#666"
              className="dark:stroke-gray-400 dark:text-gray-300"
              interval="preserveStart"
              minTickGap={30}
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              stroke="#666"
              className="dark:stroke-gray-400 dark:text-gray-300"
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            {repositories.map((repo, index) => (
              <Line
                key={repo.name}
                type="monotone"
                dataKey={repo.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
                connectNulls={false}
                monotone={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {repositories.map((repo, index) => (
            <div key={repo.name} className="flex items-center">
              <div
                className="w-3 h-3 mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-foreground">
                {repo.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CategorySection = ({ repositoriesByCategory, selectedMetric, startDate, endDate }) => {
  const topRepositoriesByCategory = useMemo(() => {
    if (!repositoriesByCategory || Object.keys(repositoriesByCategory).length === 0) {
      return {};
    }

    const result = {};
    
    Object.entries(repositoriesByCategory).forEach(([category, repositories]) => {
      if (!repositories || repositories.length === 0) return;
      
      // Get top 3 repositories by selected metric
      const sorted = [...repositories].sort((a, b) => {
        let aValue = 0;
        let bValue = 0;
        
        switch (selectedMetric) {
          case "stars":
            aValue = a.totalStars || 0;
            bValue = b.totalStars || 0;
            break;
          case "forks":
            aValue = a.totalForks || 0;
            bValue = b.totalForks || 0;
            break;
          case "issues":
            aValue = a.totalIssues || 0;
            bValue = b.totalIssues || 0;
            break;
          case "pullRequests":
            aValue = a.totalPullRequests || 0;
            bValue = b.totalPullRequests || 0;
            break;
          default:
            aValue = a.totalStars || 0;
            bValue = b.totalStars || 0;
        }
        
        return bValue - aValue;
      });
      
      result[category] = sorted.slice(0, 3);
    });
    
    return result;
  }, [repositoriesByCategory, selectedMetric]);

  const categories = Object.keys(topRepositoriesByCategory);

  if (categories.length === 0) {
    return null;
  }

  const getMetricDisplayName = () => {
    switch (selectedMetric) {
      case "stars":
        return "Stars";
      case "forks":
        return "Forks";
      case "issues":
        return "Issues";
      case "pullRequests":
        return "Pull Requests";
      default:
        return "Stars";
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Top 3 by Category - {getMetricDisplayName()}
        </h2>
        <p className="text-muted-foreground">
          Static view of the top 3 repositories in each category based on the selected metric and date range.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryChart
            key={category}
            repositories={topRepositoriesByCategory[category]}
            metric={selectedMetric}
            startDate={startDate}
            endDate={endDate}
            categoryName={category}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;