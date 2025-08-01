import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MetricSelector = ({ selectedMetric, onMetricChange }) => {
  const metrics = [
    { value: "stars", label: "Stars", icon: "⭐" },
    { value: "forks", label: "Forks", icon: "🔀" },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Metric</span>
          <div className="flex gap-2">
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
                className="flex items-center space-x-2"
              >
                <span>{metric.icon}</span>
                <span>{metric.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricSelector;
