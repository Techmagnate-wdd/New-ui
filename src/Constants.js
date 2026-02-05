export const DASHBOARD_TOOLTIPS = {

  allKeywords: `
Total unique keywords that have at least one ranking record
for the selected project and snapshot date.

Formula:
COUNT(DISTINCT keyword)
WHERE created_at = LatestDay
`,

  withoutChanges: `
Keywords whose rank position did NOT change
between previous snapshot and latest snapshot.

Formula:
latestRank === prevRank
`,

  raisedKeywords: `
Keywords that improved in ranking.

Formula:
latestRank < prevRank
(lower number = better rank)
`,

  droppedKeywords: `
Keywords that declined in ranking.

Formula:
latestRank > prevRank
`,

  newKeywords: `
Keywords that appear in the latest snapshot
but did NOT exist in previous snapshot.

Formula:
latestRank !== null AND prevRank === null
`,

  lostKeywords: `
Keywords that existed in previous snapshot
but do NOT appear in latest snapshot.

Formula:
latestRank === null AND prevRank !== null
`,

  averagePosition: `
Average of the best ranking position of each keyword
for your own domain.

Formula:
AVG( MIN(rank_group per keyword) )
WHERE domain = your site
`,

  serpFeatureCoverage: `
Overall coverage of all SERP features.

Formula:
(total ranked keywords across features ÷
 total opportunity keywords across features) × 100
`,

  aiVisibilityScore: `
Visibility inside Google AI Overview feature.

Formula:
(ranked_keywords ÷ opportunity_keywords) × 100
for AI Overview
`,

  rankingTrendAvgPos: `
Daily average position of your best ranking
for each keyword.

Formula per day:
AVG(bestRank)
`,

  rankingTrendVisibility: `
Percentage of keywords ranking for your domain
on that day.

Formula per day:
(rankedKeywords ÷ totalKeywords) × 100
`,

  featureOpportunity: `
Number of keywords where this SERP feature
exists in Google results.

Formula:
COUNT(DISTINCT keyword)
`,

  featureRanked: `
Number of keywords where YOUR site
owns this SERP feature.

Formula:
COUNT(keyword WHERE isOwnedByProject = true)
`,

  featureCoverage: `
Coverage for this SERP feature.

Formula:
(ranked_keywords ÷ opportunity_keywords) × 100
`
};
