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


  return (
    <Card>
      <CardHeader className="pb-3">
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
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="text-center">
            <Label htmlFor="start-date" className="block mb-1 text-sm">Start Date</Label>
            <Input
              type="text"
              id="start-date"
              value={formatDateForInput(startDate)}
              onChange={handleStartDateChange}
              placeholder="yyyy-MM-dd"
              pattern="\d{4}-\d{2}-\d{2}"
              title="Please enter date in yyyy-MM-dd format"
              className="text-center"
            />
          </div>

          <div className="text-center">
            <Label htmlFor="end-date" className="block mb-1 text-sm">End Date</Label>
            <Input
              type="text"
              id="end-date"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
              placeholder="yyyy-MM-dd"
              pattern="\d{4}-\d{2}-\d{2}"
              title="Please enter date in yyyy-MM-dd format"
              className="text-center"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;
