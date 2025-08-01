import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatNumber } from "../utils/dataLoader";

const RepositorySelector = ({
  repositoriesByCategory,
  selectedRepos,
  onRepoToggle,
  maxSelections = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSelectFromSearch = (repo) => {
    const isSelected = selectedRepos.some(selected => selected.name === repo.name);
    
    let newRepos;
    if (isSelected) {
      // Deselect if already selected
      newRepos = selectedRepos.filter(selected => selected.name !== repo.name);
    } else {
      // Select if not selected and within limits
      if (maxSelections && selectedRepos.length >= maxSelections) {
        return; // At max limit
      }
      newRepos = [...selectedRepos, repo];
    }
    
    requestAnimationFrame(() => {
      onRepoToggle(newRepos);
    });
  };



  const filteredRepositoriesByCategory = useMemo(() => {
    if (!searchQuery.trim()) {
      return repositoriesByCategory;
    }

    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(repositoriesByCategory).forEach(([category, repositories]) => {
      const matchingRepos = repositories.filter(repo =>
        repo.name.toLowerCase().includes(query)
      );
      if (matchingRepos.length > 0) {
        filtered[category] = matchingRepos;
      }
    });

    return filtered;
  }, [repositoriesByCategory, searchQuery]);

  const totalReposCount = Object.values(repositoriesByCategory).flat().length;

  return (
    <Card className="flex flex-col max-h-[400px] lg:max-h-[700px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg">
          Select Repositories ({selectedRepos.length}/{totalReposCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-4">
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none focus:border-primary focus-visible:ring-0"
          />
        </div>

        {searchQuery.trim() && (
          <div className="space-y-2 flex-1 overflow-y-auto mb-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
            {Object.keys(filteredRepositoriesByCategory).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No repositories found matching "{searchQuery}"
              </div>
            ) : (
              Object.entries(filteredRepositoriesByCategory).map(
                ([category, repositories]) => 
                  repositories.map((repo) => {
                    const isSelected = selectedRepos.some(
                      (selected) => selected.name === repo.name
                    );
                    const canSelect = !maxSelections || selectedRepos.length < maxSelections || isSelected;

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
                        onClick={() => canSelect && handleSelectFromSearch(repo)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {repo.name} {isSelected && "✓"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            ⭐ {formatNumber(repo.totalStars)} stars • {category.replace(/-/g, " ")}
                          </p>
                        </div>
                      </div>
                    );
                  })
              ).flat()
            )}
          </div>
        )}

        {selectedRepos.length > 0 && (
          <div className="pt-4 border-t border-border">
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
