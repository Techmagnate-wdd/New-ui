import { useContext, useEffect, useState } from 'react';
import {
  Search,
  Star,
  Sparkles,
  Video,
  Image as ImageIcon,
  MapPin,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Badge } from 'antd';

import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { TrendBadge } from '../common/TrendBadge';
import { getKeywordRankingTable, getProjects } from '../../services/api';
import { useFilter } from '../../context/SerpFilterContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { Pagination } from '../Pagination';

const getDifficultyVariant = (difficulty) => {
  if (difficulty === "High") return "destructive";
  if (difficulty === "Medium") return "default";
  if (difficulty === "Low") return "secondary";
  return "secondary";
};

export function KeywordOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('currentPosition');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedRow, setExpandedRow] = useState(null);

  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loading, setLoading] = useState(false)

  const [totalKeywords, setTotalKeywords] = useState({});
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const { filter, setFilter } = useFilter();
  const [rows, setRows] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [bucket, setBucket] = useState("");
  const [activeBucket, setActiveBucket] = useState("all_keywords");
  const [fetchStartDate, setFetchStartDate] = useState([]);

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
        const res = await getKeywordRankingTable(filter,
          paginationData.page,
          paginationData.limit,
          searchTerm,
          bucket
        );
        const data = res.data;
        setPaginationData(data.pagination)
        setRows(data?.rows || []);
        setSummaryData(data?.summary || []);
        setTotalKeywords(data.total_keywords || 0);
        setFetchStartDate(data.dateRange || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, [filter, searchTerm, bucket, paginationData.page, paginationData.limit]);

  const getFeatureIcon = (feature) => {
    if (feature.includes("people_also_ask")) return <Star className="w-4 h-4 text-yellow-600" />;
    if (feature.includes("video_pack")) return <Sparkles className="w-4 h-4 text-purple-600" />;
    if (feature.includes("image_pack")) return <Video className="w-4 h-4 text-red-600" />;
    if (feature.includes("short_videos")) return <ImageIcon className="w-4 h-4 text-blue-600" />;
    if (feature.includes("discussions_forums")) return <MapPin className="w-4 h-4 text-green-600" />;
    if (feature.includes("shopping")) return <MapPin className="w-4 h-4 text-green-600" />;
    if (feature.includes("top_stories")) return <MapPin className="w-4 h-4 text-green-600" />;
    if (feature.includes("ai_overview")) return <MapPin className="w-4 h-4 text-green-600" />;
    if (feature.includes('featured_snippet')) return <MapPin className="w-4 h-4 text-green-600" />;
    return <Star className="w-4 h-4 text-gray-600" />;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage) => {
    setPaginationData(prev => ({
      ...prev,
      page: newPage
    }));
    setExpandedRow(null);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPaginationData(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
    setExpandedRow(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className=" mb-25 round-10 bg-white pad-15 search-bar">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="ser-input">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="ser-field">

            <span
              className={activeBucket === "all_keywords" ? "active" : ""}
              onClick={() => {
                setBucket("all_keywords");
                setActiveBucket("all_keywords");
              }}
            >
              All Keywords ({summaryData?.all_keywords || 0})
            </span>

            <span
              className={activeBucket === "top_3" ? "active" : ""}
              onClick={() => {
                setBucket("top_3");
                setActiveBucket("top_3");
              }}
            >
              Top 3 ({summaryData?.top_3 || 0})
            </span>

            <span
              className={activeBucket === "trending_up" ? "active" : ""}
              onClick={() => {
                setBucket("trending_up");
                setActiveBucket("trending_up");
              }}
            >
              Trending Up ({summaryData?.trending_up || 0})
            </span>

            <span
              className={activeBucket === "trending_down" ? "active" : ""}
              onClick={() => {
                setBucket("trending_down");
                setActiveBucket("trending_down");
              }}
            >
              Trending Down ({summaryData?.trending_down || 0})
            </span>

          </div>

        </div>
      </Card>

      {/* Keywords Table */}
      {loading ? (
        <Card className="p-10">
          <div className="flex items-center justify-center">
            <span className="text-gray-500">Loading keywords...</span>
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-10">
          <div className="flex items-center justify-center">
            <span className="text-gray-500">No keywords found.</span>
          </div>
        </Card>
      ) : (
        <Card className="kew-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('keyword')}
                    className="font-semibold"
                  >
                    Keyword
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('currentPosition')}
                    className="font-semibold"
                  >
                    Position
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>SERP Features</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('searchVolume')}
                    className="font-semibold"
                  >
                    Volume
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('difficulty')}
                    className="font-semibold"
                  >
                    Difficulty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows?.map((keyword) => (
                <>
                  <TableRow key={keyword.keyword} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRow(expandedRow === keyword.keyword ? null : keyword.keyword)}
                      >
                        {expandedRow === keyword.keyword ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{keyword?.keyword || ""}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">#{keyword?.position || null}</span>
                        <span className="text-xs text-gray-500">was #{keyword?.previous_position || null}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TrendBadge
                        trend={keyword.trend.direction || 'no-change'}
                        value={keyword.trend.change || 0}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {keyword?.serp_features?.map((feature, idx) => (
                          <div key={idx} className="inline-flex items-center">
                            {getFeatureIcon(feature)}
                          </div>
                        ))}
                        {keyword.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{keyword.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">
                        {keyword?.search_volume || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {/* <Badge
                      variant={keyword.difficulty > "Low" ? 'destructive' : keyword.difficulty > "Medium" ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {keyword?.difficulty_index || 0}
                    </Badge> */}

                      <Badge
                        variant={getDifficultyVariant(keyword?.difficulty)}
                        className="text-xs"
                      >
                        {keyword?.difficulty_index ?? null}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* {expandedRow === keyword.keyword && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-gray-50">
                      <div className="pad-20">
                        <h4 className="font-semibold text-gray-900 mb-3">SERP Preview</h4>
                        <div className="pad-20 round-10 bg-white">
                          <div className="space-y-3">
                            <div className="text1">
                              <p className="text-gray-600">Ranking URL:</p>
                              <p className="text-blue-600 font-medium">{keyword.keyword}</p>
                            </div>
                            <div className="text2">
                              <p className="text-gray-600 mb-2">Active SERP Features:</p>
                              <div className="flex flex-wrap gap-2">
                                {keyword.keyword.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="gap-1">
                                    {getFeatureIcon(feature)}
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )} */}

                  {expandedRow === keyword.keyword && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-gray-50">
                        <div className="pad-20">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            SERP Preview
                          </h4>

                          <div className="pad-20 round-10 bg-white space-y-3">

                            {/* Ranking URL */}
                            <div>
                              <p className="text-gray-600">Ranking URL:</p>
                              <p className="text-blue-600 font-medium">
                                {keyword?.urls?.[0] || "N/A"}
                              </p>
                            </div>

                            {/* Active SERP Features */}
                            <div>
                              <p className="text-gray-600 mb-2">
                                Active SERP Features:
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {keyword?.serp_features?.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="gap-1">
                                    {getFeatureIcon(feature)}
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                </>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={paginationData.page}
            totalItems={paginationData.total}
            itemsPerPage={paginationData.limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </Card>
      )}
    </div>
  );
}
