import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // yyyy-MM-dd format
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Date Range</CardTitle>
          <Button
            onClick={handleReset}
            variant="link"
            size="sm"
            className="text-primary"
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="start-date">Start Date</Label>
              {startDate && (
                <Button
                  onClick={handleClearStart}
                  variant="link"
                  size="sm"
                  className="text-xs text-muted-foreground h-auto p-0"
                >
                  Clear (show all)
                </Button>
              )}
            </div>
            <Input
              type="date"
              id="start-date"
              value={formatDateForInput(startDate)}
              onChange={handleStartDateChange}
            />
          </div>

          <div>
            <Label htmlFor="end-date" className="mb-2">End Date</Label>
            <Input
              type="date"
              id="end-date"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
              min={formatDateForInput(startDate)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;
