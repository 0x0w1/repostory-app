// Get branch from environment variable, default to 'develop'
const getBranch = () => {
  return import.meta.env.VITE_DATA_BRANCH || "develop";
};

export const loadRepositoryData = async () => {
  try {
    const branch = getBranch();
    const repositoriesResponse = await fetch(
      `https://raw.githubusercontent.com/0x0w1/repostory/refs/heads/${branch}/repositories.json`
    );
    const repositoriesConfig = await repositoriesResponse.json();

    const repositoriesByCategory = {};

    // Process all categories in parallel
    const categoryPromises = Object.entries(repositoriesConfig).map(
      async ([category, urls]) => {
        // Process all URLs in a category in parallel
        const repoPromises = urls.map(async (url) => {
          try {
            const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
              const [, owner, repo] = match;
              const fileName = `${owner}_${repo}.json`;
              const dataUrl = `https://raw.githubusercontent.com/0x0w1/repostory/refs/heads/${branch}/repo_data/${fileName}`;

              const response = await fetch(dataUrl);
              const data = await response.json();

              return {
                name: `${owner}/${repo}`,
                fileName: fileName,
                totalStars: data.total_stars,
                totalForks: data.total_forks,
                totalIssues: data.total_issues,
                totalPullRequests: data.total_pull_requests,
                fetchedAt: data.fetched_at,
                starsByDate: data.stars_by_date || {},
                forksByDate: data.forks_by_date || {},
                issuesByDate: data.issues_by_date || {},
                pullRequestsByDate: data.pull_requests_by_date || {},
                category: category,
                url: url,
              };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to load data for ${url}:`, error);
            return null;
          }
        });

        const repos = await Promise.all(repoPromises);
        const validRepos = repos.filter(repo => repo !== null);
        
        // Sort by total stars (descending)
        validRepos.sort((a, b) => b.totalStars - a.totalStars);
        
        return [category, validRepos];
      }
    );

    const categoryResults = await Promise.all(categoryPromises);
    
    // Convert results back to object format
    for (const [category, repos] of categoryResults) {
      repositoriesByCategory[category] = repos;
    }

    return repositoriesByCategory;
  } catch (error) {
    console.error("Failed to load repository data:", error);
    return {};
  }
};

// Cache for processed time series data
const processedDataCache = new Map();

export const processTimeSeriesData = (starsByDate, forksByDate, issuesByDate = {}, pullRequestsByDate = {}) => {
  // Create cache key from data
  const cacheKey = JSON.stringify({
    starsCount: Object.keys(starsByDate).length,
    forksCount: Object.keys(forksByDate).length,
    issuesCount: Object.keys(issuesByDate).length,
    pullRequestsCount: Object.keys(pullRequestsByDate).length,
    lastStarsDate: Math.max(
      ...Object.keys(starsByDate).map((d) => new Date(d).getTime())
    ),
    lastForksDate: Math.max(
      ...Object.keys(forksByDate).map((d) => new Date(d).getTime())
    ),
    lastIssuesDate: Object.keys(issuesByDate).length > 0 ? Math.max(
      ...Object.keys(issuesByDate).map((d) => new Date(d).getTime())
    ) : 0,
    lastPullRequestsDate: Object.keys(pullRequestsByDate).length > 0 ? Math.max(
      ...Object.keys(pullRequestsByDate).map((d) => new Date(d).getTime())
    ) : 0,
  });

  if (processedDataCache.has(cacheKey)) {
    return processedDataCache.get(cacheKey);
  }

  // Get all dates and convert to timestamps for faster sorting
  const starDates = Object.keys(starsByDate);
  const forkDates = Object.keys(forksByDate);
  const issueDates = Object.keys(issuesByDate);
  const pullRequestDates = Object.keys(pullRequestsByDate);
  const allDates = [...new Set([...starDates, ...forkDates, ...issueDates, ...pullRequestDates])];

  // Sort by timestamp (faster than string comparison)
  const sortedDates = allDates.sort((a, b) => new Date(a) - new Date(b));

  let cumulativeStars = 0;
  let cumulativeForks = 0;
  let cumulativeIssues = 0;
  let cumulativePullRequests = 0;

  const timeSeriesData = sortedDates.map((date) => {
    const dailyStars = starsByDate[date] || 0;
    const dailyForks = forksByDate[date] || 0;
    const dailyIssues = issuesByDate[date] || 0;
    const dailyPullRequests = pullRequestsByDate[date] || 0;

    cumulativeStars += dailyStars;
    cumulativeForks += dailyForks;
    cumulativeIssues += dailyIssues;
    cumulativePullRequests += dailyPullRequests;

    return {
      date,
      stars: cumulativeStars,
      forks: cumulativeForks,
      issues: cumulativeIssues,
      pullRequests: cumulativePullRequests,
      dailyStars,
      dailyForks,
      dailyIssues,
      dailyPullRequests,
    };
  });

  // Cache the result
  processedDataCache.set(cacheKey, timeSeriesData);

  // Limit cache size to prevent memory leaks
  if (processedDataCache.size > 100) {
    const firstKey = processedDataCache.keys().next().value;
    processedDataCache.delete(firstKey);
  }

  return timeSeriesData;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export const refreshRepositoryData = async (selectedRepos) => {
  const branch = getBranch();

  // Process all repositories in parallel
  const refreshPromises = selectedRepos.map(async (repo) => {
    try {
      const dataUrl = `https://raw.githubusercontent.com/0x0w1/repostory/refs/heads/${branch}/repo_data/${
        repo.fileName
      }?t=${Date.now()}`;
      const response = await fetch(dataUrl, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await response.json();

      return {
        ...repo,
        totalStars: data.total_stars,
        totalForks: data.total_forks,
        totalIssues: data.total_issues,
        totalPullRequests: data.total_pull_requests,
        fetchedAt: data.fetched_at,
        starsByDate: data.stars_by_date || {},
        forksByDate: data.forks_by_date || {},
        issuesByDate: data.issues_by_date || {},
        pullRequestsByDate: data.pull_requests_by_date || {},
      };
    } catch (error) {
      console.warn(`Failed to refresh ${repo.name}:`, error);
      return repo; // Return original repo data on error
    }
  });

  const refreshedRepos = await Promise.all(refreshPromises);
  return refreshedRepos;
};
