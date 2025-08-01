import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HomePage = () => {
  const navigate = useNavigate();

  const handleRepositoryTrendsClick = () => {
    navigate('/repository-trends');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="text-center space-y-8 p-8">
          <h1 className="text-6xl font-bold text-foreground mb-12">
            0x0w1
          </h1>
          
          <div className="space-y-4">
            <Button
              onClick={handleRepositoryTrendsClick}
              size="lg"
              className="w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Repository Trends
            </Button>
            
            <div className="space-y-3">
              <Button
                disabled
                size="lg"
                variant="secondary"
                className="w-full opacity-50"
              >
                Upcoming
              </Button>
              
              <Button
                disabled
                size="lg"
                variant="secondary"
                className="w-full opacity-50"
              >
                Upcoming
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;