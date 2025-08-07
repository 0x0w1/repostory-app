import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MetricSelector = ({ selectedMetric, onMetricChange }) => {
  const metrics = [
    { value: "stars", label: "Stars", icon: "⭐" },
    { value: "forks", label: "Forks", icon: "🔀" },
    { value: "issues", label: "Issues", icon: "❗" },
    { value: "pullRequests", label: "PRs", icon: "🔄" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Metric</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {metrics.map((metric) => (
            <Button
              key={metric.value}
              onClick={() => {
                // Use requestAnimationFrame for smoother metric transitions
                requestAnimationFrame(() => {
                  onMetricChange(metric.value);
                });
              }}
              variant={selectedMetric === metric.value ? "default" : "outline"}
              className="flex items-center justify-center space-x-2 h-12 text-sm"
            >
              <span>{metric.icon}</span>
              <span className="hidden sm:inline lg:inline">{metric.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricSelector;
