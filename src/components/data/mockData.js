// Mock Keywords Data
export const mockKeywords = [
  {
    id: '1',
    keyword: 'SEO tools comparison',
    currentPosition: 3,
    previousPosition: 5,
    trend: 'up',
    serpFeatures: ['Featured Snippet', 'People Also Ask', 'Video Pack'],
    platforms: ['Google Web', 'YouTube'],
    url: '/seo-tools-comparison',
    searchVolume: 12000,
    difficulty: 68
  },
  {
    id: '2',
    keyword: 'best rank tracker',
    currentPosition: 7,
    previousPosition: 4,
    trend: 'down',
    serpFeatures: ['AI Overview', 'Shopping', 'Local Pack'],
    platforms: ['Google Web', 'Bing'],
    url: '/rank-tracker',
    searchVolume: 8500,
    difficulty: 72
  },
  {
    id: '3',
    keyword: 'keyword research guide',
    currentPosition: 2,
    previousPosition: 2,
    trend: 'stable',
    serpFeatures: ['Featured Snippet', 'AI Overview', 'Image Pack'],
    platforms: ['Google Web', 'Image Search'],
    url: '/keyword-research',
    searchVolume: 15000,
    difficulty: 65
  },
  {
    id: '4',
    keyword: 'local SEO tips',
    currentPosition: 1,
    previousPosition: 3,
    trend: 'up',
    serpFeatures: ['Local Pack', 'People Also Ask', 'Video Pack'],
    platforms: ['Google Web', 'YouTube', 'Local'],
    url: '/local-seo',
    searchVolume: 9200,
    difficulty: 58
  },
  {
    id: '5',
    keyword: 'technical SEO audit',
    currentPosition: 5,
    previousPosition: 5,
    trend: 'stable',
    serpFeatures: ['Featured Snippet', 'AI Overview'],
    platforms: ['Google Web'],
    url: '/technical-seo',
    searchVolume: 6800,
    difficulty: 75
  },
  {
    id: '6',
    keyword: 'content optimization strategy',
    currentPosition: 8,
    previousPosition: 6,
    trend: 'down',
    serpFeatures: ['People Also Ask', 'Image Pack'],
    platforms: ['Google Web', 'Image Search'],
    url: '/content-optimization',
    searchVolume: 5400,
    difficulty: 62
  },
  {
    id: '7',
    keyword: 'backlink analysis tool',
    currentPosition: 4,
    previousPosition: 7,
    trend: 'up',
    serpFeatures: ['Featured Snippet', 'AI Overview', 'Shopping'],
    platforms: ['Google Web', 'App Store'],
    url: '/backlink-analysis',
    searchVolume: 11000,
    difficulty: 70
  },
  {
    id: '8',
    keyword: 'mobile SEO best practices',
    currentPosition: 6,
    previousPosition: 6,
    trend: 'stable',
    serpFeatures: ['People Also Ask', 'Video Pack', 'Image Pack'],
    platforms: ['Google Web', 'YouTube'],
    url: '/mobile-seo',
    searchVolume: 7300,
    difficulty: 64
  }
];

// Mock SERP Features
export const mockSerpFeatures = [
  { name: 'Featured Snippet', icon: 'star', count: 42, percentage: 68, trend: 'up' },
  { name: 'People Also Ask', icon: 'help-circle', count: 38, percentage: 62, trend: 'stable' },
  { name: 'AI Overview', icon: 'sparkles', count: 35, percentage: 57, trend: 'up' },
  { name: 'Local Pack', icon: 'map-pin', count: 18, percentage: 29, trend: 'stable' },
  { name: 'Video Pack', icon: 'video', count: 22, percentage: 36, trend: 'up' },
  { name: 'Image Pack', icon: 'image', count: 25, percentage: 41, trend: 'stable' },
  { name: 'Shopping', icon: 'shopping-cart', count: 12, percentage: 19, trend: 'down' },
  { name: 'News', icon: 'newspaper', count: 8, percentage: 13, trend: 'stable' },
  { name: 'Short Videos', icon: 'film', count: 15, percentage: 24, trend: 'up' },
  { name: 'AI Mode', icon: 'bot', count: 28, percentage: 45, trend: 'up' }
];

// Mock Platforms
export const mockPlatforms = [
  { name: 'Google Web', icon: 'globe', keywordsRanked: 156, averagePosition: 4.2, trend: 'up' },
  { name: 'Image Search', icon: 'image', keywordsRanked: 48, averagePosition: 7.8, trend: 'stable' },
  { name: 'YouTube', icon: 'youtube', keywordsRanked: 32, averagePosition: 12.3, trend: 'up' },
  { name: 'App Store', icon: 'smartphone', keywordsRanked: 15, averagePosition: 8.5, trend: 'down' },
  { name: 'Bing', icon: 'search', keywordsRanked: 89, averagePosition: 6.1, trend: 'stable' },
  { name: 'Local', icon: 'map-pin', keywordsRanked: 24, averagePosition: 3.2, trend: 'up' }
];

// Mock Alerts
export const mockAlerts = [
  {
    id: 'a1',
    type: 'rank_drop',
    title: 'Significant Rank Drop',
    description: 'Dropped from position 4 to 7',
    keyword: 'best rank tracker',
    timestamp: '2 hours ago',
    severity: 'high'
  },
  {
    id: 'a2',
    type: 'feature_loss',
    title: 'Featured Snippet Lost',
    description: 'No longer showing in featured snippet',
    keyword: 'SEO tools comparison',
    timestamp: '5 hours ago',
    severity: 'medium'
  },
  {
    id: 'a3',
    type: 'ai_visibility',
    title: 'New AI Overview Appearance',
    description: 'Now appearing in AI Overview',
    keyword: 'keyword research guide',
    timestamp: '1 day ago',
    severity: 'low'
  },
  {
    id: 'a4',
    type: 'competitor_takeover',
    title: 'Competitor Takeover',
    description: 'Competitor now ranks #1',
    keyword: 'content optimization strategy',
    timestamp: '3 hours ago',
    severity: 'high'
  }
];

// Mock AI Insights
export const mockAIInsights = [
  {
    id: 'i1',
    type: 'opportunity',
    title: 'AI Overview Opportunity',
    description: '12 keywords could benefit from structured FAQ content to appear in AI Overviews',
    affectedKeywords: 12,
    priority: 'high'
  },
  {
    id: 'i2',
    type: 'risk',
    title: 'Featured Snippet Vulnerability',
    description: '8 featured snippets at risk due to outdated content',
    affectedKeywords: 8,
    priority: 'high'
  },
  {
    id: 'i3',
    type: 'complexity',
    title: 'High SERP Complexity',
    description: '15 keywords have highly complex SERPs with 5+ features',
    affectedKeywords: 15,
    priority: 'medium'
  },
  {
    id: 'i4',
    type: 'mismatch',
    title: 'Content Format Mismatch',
    description: '6 keywords need video content to match SERP intent',
    affectedKeywords: 6,
    priority: 'medium'
  }
];

// Chart Data
export const rankingTrendData = [
  { date: 'Jan 15', avgPosition: 5.2, visibility: 65 },
  { date: 'Jan 16', avgPosition: 4.8, visibility: 68 },
  { date: 'Jan 17', avgPosition: 4.5, visibility: 70 },
  { date: 'Jan 18', avgPosition: 4.3, visibility: 72 },
  { date: 'Jan 19', avgPosition: 4.6, visibility: 69 },
  { date: 'Jan 20', avgPosition: 4.2, visibility: 73 },
  { date: 'Jan 21', avgPosition: 3.9, visibility: 76 },
  { date: 'Jan 22', avgPosition: 4.1, visibility: 74 }
];

export const serpFeatureDistribution = [
  { name: 'Featured Snippet', value: 42, color: '#3b82f6' },
  { name: 'AI Overview', value: 35, color: '#8b5cf6' },
  { name: 'People Also Ask', value: 38, color: '#06b6d4' },
  { name: 'Local Pack', value: 18, color: '#10b981' },
  { name: 'Video Pack', value: 22, color: '#f59e0b' },
  { name: 'Other', value: 25, color: '#6b7280' }
];

export const platformShareData = [
  { platform: 'Google Web', share: 45, color: '#3b82f6' },
  { platform: 'Image Search', share: 18, color: '#06b6d4' },
  { platform: 'YouTube', share: 12, color: '#ef4444' },
  { platform: 'Bing', share: 15, color: '#10b981' },
  { platform: 'Local', share: 10, color: '#f59e0b' }
];
