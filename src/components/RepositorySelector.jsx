import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Select Repositories</CardTitle>
          <span className="text-sm text-muted-foreground">
            {selectedRepos.length}{maxSelections ? `/${maxSelections}` : ''} selected
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button
            onClick={handleSelectAll}
            disabled={!canSelectAll}
            size="sm"
            variant={canSelectAll ? "default" : "secondary"}
          >
            Select All ({maxSelections ? Math.min(maxSelections, allReposCount) : allReposCount})
          </Button>

          <Button
            onClick={handleDeselectAll}
            disabled={!hasSelections}
            size="sm"
            variant={hasSelections ? "secondary" : "outline"}
          >
            Deselect All
          </Button>
        </div>

        <div className="space-y-4 max-h-192 overflow-y-auto">
          {Object.entries(repositoriesByCategory).map(
            ([category, repositories]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-foreground capitalize border-b border-border pb-1">
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
                          ? "bg-primary/10 border-primary"
                          : canSelect
                          ? "hover:bg-accent border-border"
                          : "opacity-50 cursor-not-allowed border-border"
                      }`}
                      onClick={() => canSelect && handleToggle(repo)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={!canSelect}
                        className="mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {repo.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
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
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Selected repositories:</p>
            <div className="flex flex-wrap gap-2">
              {selectedRepos.map((repo) => (
                <Badge key={repo.name} variant="secondary" className="cursor-pointer">
                  {repo.name}
                  <button
                    onClick={() => handleToggle(repo)}
                    className="ml-1 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepositorySelector;
