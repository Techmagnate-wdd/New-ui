import {
  Search,
  TrendingUp,
  Star,
  Sparkles,
  AlertTriangle,
  ArrowUpCircle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Bar,
  ComposedChart
} from "recharts";
import {
  mockAlerts,
  mockPlatforms,
  mockSerpFeatures,
  // rankingTrendData,
  serpFeatureDistribution,
} from "../data/mockData";
import { TrendBadge } from "../common/TrendBadge";
import { Badge } from "antd";
import { KPICard } from "../common/KPICard";
import { Card } from "../ui/card";
import { useContext, useEffect, useMemo, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboardCount, getKeywordSummary, getProjects, getSerpFeatureSummary, getVisibilityTrend } from "../../services/api";
import dayjs from "dayjs";
import ProjectDropdown from "../../pages/Dashboard/ProjectDropdown";
import { useFilter } from "../../context/SerpFilterContext";
import { DASHBOARD_TOOLTIPS } from "../../Constants";
import { InfoTooltip } from "../InfoTooltip";
import TooltipIcon from "../../pages/LLM/ToolTipIcon";
import { CustomLegend } from "../CustomLegend";

const FEATURE_MAP = {
  featured_snippet: "Featured Snippet",
  people_also_ask: "People Also Ask",
  ai_overview: "AI Overview",
  local_pack: "Local Pack",
  app_pack: "App Pack",
  video_pack: "Video Pack",
  image_pack: "Image Pack",
  short_videos: "Short Videos",
  discussions_forums: "Discussions & Forums",
  shopping: "Shopping",
  top_stories: "Top Stories"
};


export function SummaryDashboard() {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loading, setLoading] = useState(false)

  const [totalKeywords, setTotalKeywords] = useState({});
  const [withoutChangesKeywords, setWithoutChangesKeywords] = useState({});
  const [droppedKeywords, setDroppedKeywords] = useState({});
  const [lostKeywords, setLostKeywords] = useState({});
  const [raisedKeywords, setRaisedKeywords] = useState({});
  const [newKeywords, setNewKeywords] = useState({});
  const [averagePosition, setAveragePosition] = useState({});
  const [serpDistribution, setSerpDistribution] = useState([]);
  const [serpFeatures, setSerpFeatures] = useState([]);
  const [featureCoverage, setFeatureCoverage] = useState([]);
  const [AIVisibiltyScore, setAIVisibiltyScore] = useState(0);
  const [rankingTrendData, setRankingTrendData] = useState([]);
  const [featureTrends, setFeatureTrends] = useState([]);
  const { filter, setFilter } = useFilter();

  // Load user projects
  useEffect(() => {
    if (user) {
      const userId = user?._id;
      setFilter((prev) => ({ ...prev, user: userId }));
      fetchProjects(userId);
    } else {
      navigate("/login");
    }
  }, [user]);

  const fetchProjects = async (userId) => {
    setLoadingProjects(true);
    try {
      const res = await getProjects({ user: userId });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProjects(false);
    }
  };
  // Set default project when list arrives
  useEffect(() => {
    if (projects.length) {
      const defaultProject = projects[0]._id;
      setFilter((prev) => ({ ...prev, project: defaultProject }));
    }
  }, [projects, userRole]);

  // Fetch dashboard data whenever the project or dates change
  useEffect(() => {
    const fetchData = async () => {
      if (!filter.project) return;
      setLoading(true)
      try {
        const res = await getKeywordSummary(filter);
        const data = res.data;
        setTotalKeywords(data.total_keywords || 0);
        setWithoutChangesKeywords(data.without_changes || 0);
        setRaisedKeywords(data.raised || 0);
        setDroppedKeywords(data.dropped || 0);
        setLostKeywords(data.lost || 0);
        setNewKeywords(data.new_keywords || 0);
        setAveragePosition(data.average_position || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, [filter]);

  // Fetch dashboard data whenever the project or dates change
  useEffect(() => {
    const fetchData = async () => {
      if (!filter.project) return;
      setLoading(true)
      try {
        const res = await getSerpFeatureSummary(filter);
        const data = res?.data;

        const featureArray = Object.entries(data?.features || {}).map(
          ([feature, values]) => ({
            feature,
            opportunity_keywords: values.opportunity_keywords,
            ranked_keywords: values.ranked_keywords,
            coverage: values.coverage
          })
        );


        const featureTrendArray = Object.entries(data?.trends || {}).map(
          ([feature, values]) => ({
            feature,
            percentage_change: values.percentage_change,
          })
        );
        setFeatureTrends(featureTrendArray);

        let ai_visibility = featureArray.find((f => f.feature === 'ai_overview'));
        let ai_visibility_coverage = ai_visibility ? (ai_visibility.ranked_keywords * 100) / ai_visibility.opportunity_keywords : 0;
        setAIVisibiltyScore(Math.round(ai_visibility_coverage));

        // Sum across all features
        const totals = featureArray.reduce(
          (acc, feature) => {
            acc.opportunity += feature.opportunity_keywords || 0;
            acc.ranked += feature.ranked_keywords || 0;
            return acc;
          },
          { opportunity: 0, ranked: 0 }
        );

        // Final overall coverage %
        const overallCoverage =
          totals.opportunity > 0
            ? Math.round((totals.ranked / totals.opportunity) * 100)
            : 0;

        setFeatureCoverage(overallCoverage);

        let distribution = data?.distribution || null;
        setSerpFeatures(featureArray);
        setSerpDistribution(distribution);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, [filter]);

  // // Fetch dashboard data whenever the project or dates change
  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!filter.project) return;
  //     setLoading(true)
  //     try {
  //       const res = await getVisibilityTrend(filter);
  //       const data = res?.data;
  //       console.log(data, "visibility trend data")
  //       const chartData = data.map((item) => ({
  //         ...item,
  //         top1: item.rankDistribution?.top1 || 0,
  //         top2_3: item.rankDistribution?.top2_3 || 0,
  //         top4_5: item.rankDistribution?.top4_5 || 0,
  //         top6_10: item.rankDistribution?.top6_10 || 0,
  //         outOf10: item.rankDistribution?.outOf10 || 0,
  //       }));
  //       setRankingTrendData(data.data || []);

  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false)
  //     }
  //   };
  //   fetchData();
  // }, [filter]);

  // Fetch visibility + ranking distribution trend
  // Fetch visibility + ranking distribution trend
  useEffect(() => {
    const fetchData = async () => {
      if (!filter.project) return;

      setLoading(true);
      try {
        const res = await getVisibilityTrend(filter);

        // API -> { success:true, data:[...] }
        const apiData = res?.data?.data || [];

        const chartData = apiData.map((item) => ({
          ...item,
          top1: item.rankDistribution?.top1 ?? 0,
          top2_3: item.rankDistribution?.top2_3 ?? 0,
          top4_5: item.rankDistribution?.top4_5 ?? 0,
          top6_10: item.rankDistribution?.top6_10 ?? 0,
          outOf10: item.rankDistribution?.outOf10 ?? 0,
        }));

        setRankingTrendData(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter.project]);



  // helper
  const getCoveragePercent = (f) => {
    if (!f?.opportunity_keywords) return 0;
    return Math.round((f.ranked_keywords / f.opportunity_keywords) * 100);
  };

  const sortedFeatures = useMemo(() => {
    return [...serpFeatures].sort(
      (a, b) => getCoveragePercent(b) - getCoveragePercent(a)
    );
  }, [serpFeatures]);

  // sort once
  // const sortedFeatures = [...serpFeatures].sort(
  //   (a, b) => getCoveragePercent(b) - getCoveragePercent(a)
  // );


  const getFeatureTrend = (featureKey) => {
    if (!Array.isArray(featureTrends)) return null;
    return featureTrends.find((f) => f.feature === featureKey);
  };

  return (
    <div className="">
      <div className="submit-dash flex-wrap">
        <KPICard
          title="All Keywords"
          tooltipTitle={DASHBOARD_TOOLTIPS.allKeywords}
          value={totalKeywords.value}
          change={totalKeywords.change}
          trend={totalKeywords.trend}
          icon={Search}
          iconColor="text-blue-600"
        />

        <KPICard
          title="Without Changes"
          tooltipTitle={DASHBOARD_TOOLTIPS.withoutChanges}
          value={withoutChangesKeywords.value}
          change={withoutChangesKeywords.change}
          trend={withoutChangesKeywords.trend}
          icon={Search}
          iconColor="text-blue-600"
        />
        <KPICard
          title="Dropped"
          tooltipTitle={DASHBOARD_TOOLTIPS.droppedKeywords}
          value={droppedKeywords.value}
          change={droppedKeywords.change}
          trend={droppedKeywords.trend}
          icon={Search}
          iconColor="text-blue-600"
        />
        <KPICard
          title="Lost"
          tooltipTitle={DASHBOARD_TOOLTIPS.lostKeywords}
          value={lostKeywords.value}
          change={lostKeywords.change}
          trend={lostKeywords.trend}
          icon={Search}
          iconColor="text-blue-600"
        />
        <KPICard
          title="Raised"
          tooltipTitle={DASHBOARD_TOOLTIPS.raisedKeywords}
          value={raisedKeywords.value}
          change={raisedKeywords.change}
          trend={raisedKeywords.trend}
          icon={Search}
          iconColor="text-blue-600"
        />
        <KPICard
          title="New Keywords"
          tooltipTitle={DASHBOARD_TOOLTIPS.newKeywords}
          value={newKeywords.value}
          change={newKeywords.change}
          trend={newKeywords.trend}
          icon={Search}
          iconColor="text-blue-600"
        />
        <KPICard
          title="Average Position"
          tooltipTitle={DASHBOARD_TOOLTIPS.averagePosition}
          value={averagePosition.value}
          change={averagePosition.change}
          trend={averagePosition.trend}
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <KPICard
          title="SERP Feature Coverage"
          tooltipTitle={DASHBOARD_TOOLTIPS.serpFeatureCoverage}
          value={`${featureCoverage}%`}
          change={12}
          trend="up"
          icon={Star}
          iconColor="text-yellow-600"
        />
        <KPICard
          tooltipTitle={DASHBOARD_TOOLTIPS.aiVisibilityScore}
          title="AI Visibility Score"
          value={`${AIVisibiltyScore}%`}
          change={15}
          trend="up"
          icon={Sparkles}
          iconColor="text-purple-600"
        />
      </div>

      {/* Ranking Trend Chart */}
      <Card className="round-10 pad-20 mb-25 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 fw-700 mb-25">
          Ranking Trend
        </h3>

        {/* <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rankingTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend content={<CustomLegend tooltipTitle={DASHBOARD_TOOLTIPS.rankingTrendVisibility} />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgPosition"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Avg Position"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="visibility"
              stroke="#10b981"
              strokeWidth={2}
              name="Visibility %"
            />
          </LineChart>
        </ResponsiveContainer> */}

        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={rankingTrendData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            {/* LEFT AXIS → Avg Position */}
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#3b82f6"
              label={{ value: 'Avg Position', angle: -90, position: 'insideLeft' }}
            />

            {/* RIGHT AXIS → Visibility */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              label={{ value: 'Visibility %', angle: 90, position: 'insideRight' }}
            />

            {/* HIDDEN AXIS FOR BARS */}
            <YAxis yAxisId="bar" hide />

            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* ===== STACKED BARS (RANK DISTRIBUTION) ===== */}
            <Bar
              yAxisId="bar"
              dataKey="top1"
              stackId="rank"
              fill="#16a34a"
              name="Top 1"
            />
            <Bar
              yAxisId="bar"
              dataKey="top2_3"
              stackId="rank"
              fill="#22c55e"
              name="Top 2-3"
            />
            <Bar
              yAxisId="bar"
              dataKey="top4_5"
              stackId="rank"
              fill="#3b82f6"
              name="Top 4-5"
            />
            <Bar
              yAxisId="bar"
              dataKey="top6_10"
              stackId="rank"
              fill="#f59e0b"
              name="Top 6-10"
            />
            <Bar
              yAxisId="bar"
              dataKey="outOf10"
              stackId="rank"
              fill="#ef4444"
              name="> 10"
            />

            {/* ===== LINES ===== */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgPosition"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Avg Position"
              dot={{ r: 4 }}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="visibility"
              stroke="#10b981"
              strokeWidth={2}
              name="Visibility %"
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className="dis-flex mb-25">
        {/* SERP Feature Coverage */}
        <Card className="chart-div pad-15 round-10 pad-20 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-25">
            SERP Feature Coverage
          </h3>
          <div className="space-y-3">
            {sortedFeatures.map((feature) => (
              <div
                key={feature.feature}
                className="dis-flex align-items-center justify-between mb-10"
              >
                {/* LEFT SIDE */}
                <div className="dis-flex align-items-center">
                  <div className="start-lft">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="start-rght">
                    <p className="text-sm font-medium text-gray-900">
                      {FEATURE_MAP[feature.feature]}
                    </p>

                    <p className="text-xs text-gray-500">
                      {feature.opportunity_keywords} keywords
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="dis-flex align-items-center gap-2">
                  <span className="coverage-pill">
                    {getCoveragePercent(feature)}%
                  </span>

                  {(() => {
                    const trendObj = getFeatureTrend(feature.feature);

                    return (
                      <TrendBadge
                        trend={
                          trendObj?.percentage_change > 0
                            ? "up"
                            : trendObj?.percentage_change < 0
                              ? "down"
                              : "flat"
                        }
                        size="sm"
                      />
                    );
                  })()}

                </div>
              </div>
            ))}

          </div>
        </Card>

        {/* SERP Feature Distribution */}
        <Card className="chart-div pad-15 round-10 pad-20 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-25">
            Feature Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={serpDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {serpFeatureDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Platform Presence */}
      {/* <Card className="round-10 pad-20 mb-25 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-25">
          Platform Presence
        </h3>
        <div className="pltform-search">
          {mockPlatforms.map((platform) => (
            <div key={platform.name} className="inner-pltfrm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{platform.name}</h4>
                <TrendBadge trend={platform.trend} size="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Keywords:</span>
                  <span className="font-medium text-gray-900">
                    {platform.keywordsRanked}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Position:</span>
                  <span className="font-medium text-gray-900">
                    {platform.averagePosition}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card> */}

      {/* Alert Highlights */}
      {/* <Card className="round-10 pad-20 mb-25 bg-white">
        <div className="flex items-center justify-between mb-25">
          <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
          <Badge color="blue">{mockAlerts.length} active</Badge>
        </div>
        <div className="space-y-3 alert-sec">
          {mockAlerts.map((alert) => {
            const severityColor =
              alert.severity === "high"
                ? "border-red-200 bg-red-50"
                : alert.severity === "medium"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-blue-200 bg-blue-50";

            const iconColor =
              alert.severity === "high"
                ? "text-red-600"
                : alert.severity === "medium"
                  ? "text-yellow-600"
                  : "text-blue-600";

            return (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${severityColor}`}
              >
                <div className="flex items-start gap-3">
                  {alert.type === "rank_drop" && (
                    <AlertTriangle
                      className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
                    />
                  )}
                  {alert.type === "feature_loss" && (
                    <Star
                      className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
                    />
                  )}
                  {alert.type === "ai_visibility" && (
                    <Sparkles
                      className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
                    />
                  )}
                  {alert.type === "competitor_takeover" && (
                    <ArrowUpCircle
                      className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {alert.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Keyword:{" "}
                      <span className="font-medium">{alert.keyword}</span>
                    </p>
                  </div>
                </div>
                <div className="">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {alert.timestamp}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </Card> */}
    </div>
  );
}
