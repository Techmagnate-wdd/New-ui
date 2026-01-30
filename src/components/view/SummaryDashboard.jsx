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
} from "recharts";
import {
  mockAlerts,
  mockPlatforms,
  mockSerpFeatures,
  rankingTrendData,
  serpFeatureDistribution,
} from "../data/mockData";
import { TrendBadge } from "../common/TrendBadge";
import { Badge } from "antd";
import { KPICard } from "../common/KPICard";
import { Card } from "../ui/card";

export function SummaryDashboard() {
  return (
    <div className="">
      {/* KPI Cards */}
      <div className="submit-dash">
        <KPICard
          title="Total Keywords Tracked"
          value={156}
          change={8}
          trend="up"
          icon={Search}
          iconColor="text-blue-600"
        />
        <KPICard
          title="Average Position"
          value={4.2}
          change={-5}
          trend="up"
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <KPICard
          title="SERP Feature Coverage"
          value="68%"
          change={12}
          trend="up"
          icon={Star}
          iconColor="text-yellow-600"
        />
        <KPICard
          title="AI Visibility Score"
          value="73%"
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
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rankingTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend />
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
        </ResponsiveContainer>
      </Card>

      <div className="dis-flex mb-25">
        {/* SERP Feature Coverage */}
        <Card className="chart-div pad-15 round-10 pad-20 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-25">
            SERP Feature Coverage
          </h3>
          <div className="space-y-3">
            {mockSerpFeatures.slice(0, 6).map((feature) => (
              <div
                key={feature.name}
                className="dis-flex align-items-center mb-10"
              >
                <div className="dis-flex align-items-center">
                  <div className="start-lft">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="start-rght">
                    <p className="text-sm font-medium text-gray-900">
                      {feature.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {feature.count} keywords
                    </p>
                  </div>
                </div>
                <div className="dis-flex per-side align-items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {feature.percentage}%
                  </span>
                  <TrendBadge trend={feature.trend} size="sm" />
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
                data={serpFeatureDistribution}
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
      <Card className="round-10 pad-20 mb-25 bg-white">
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
      </Card>

      {/* Alert Highlights */}
      <Card className="round-10 pad-20 mb-25 bg-white">
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
      </Card>
    </div>
  );
}
