import React, { useContext, useEffect, useState } from "react";
import DashboardRankingCard from "./DashboardRankingCard";
import SearchVolumeTable from "./SearchVolumeTable";

import { dashboardCount, getProjects } from "../../services/api";
import dayjs from "dayjs";
import AuthContext from "../../context/AuthContext";
import RankingChart from "./RankingChart";
import { useNavigate } from "react-router-dom";
import ProjectDropdown from "./ProjectDropdown";
import DashboardRankingCardSkeleton from "./DashboardRankingCardSkeleton";
import SearchVolumeTableSkeleton from "./SearchVolumeTableSkeleton";
import RankingChartSkeleton from "./RankingChartSkeleton";

const DashBoardLayerOne = () => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";
  const navigate = useNavigate();

  const [filter, setFilter] = useState({
    project: "",
    user: "",
    dateRange: [],
    /* other filters */
  });
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loading, setLoading] = useState(false)

  const [chartData, setChartData] = useState([]);
  const [topKeywords, setTopKeywords] = useState([]);
  const [stats, setStats] = useState({
    totalKeywords: 0,
    rank1: 0,
    rank2_3: 0,
    rank4_5: 0,
    rank6_10: 0,
  });

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
      console.log(res, "res")
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
      console.log(projects, "projects")
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
        const startDate = filter.dateRange[0]
          ? dayjs(filter.dateRange[0]).format("YYYY-MM-DD")
          : "";
        const endDate = filter.dateRange[1]
          ? dayjs(filter.dateRange[1]).format("YYYY-MM-DD")
          : "";

        const res = await dashboardCount(filter.project, startDate, endDate);
        const data = res.data;
        setChartData(data.dateWiseData || []);
        setTopKeywords(data.top_sv_keywords || []);
        setStats({
          totalKeywords: data.totalKeywords || 0,
          rank1: data?.lastDateCards.rank1 || 0,
          rank2_3: data?.lastDateCards.rank2to3 || 0,
          rank4_5: data?.lastDateCards.rank4to5 || 0,
          rank6_10: data?.lastDateCards.rank6to10 || 0,
          rank10plus: data?.lastDateCards.rank10plus || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, [filter.project, filter.dateRange]);

  return (
    <div className="container1 mx-auto ">
      <div className="flex items-center mb-8">
        <div>
          <ProjectDropdown
            title="Projects"
            value={filter.project}
            loading={loadingProjects}
            projects={projects}
            onChange={(value) =>
              setFilter((prev) => ({ ...prev, project: value }))
            }
          />
        </div>
      </div>

      {loading ? (
        <>
          {/* Skeletons while API is loading */}
          <DashboardRankingCardSkeleton />
          <section className="row gy-4 mt-8">
            <SearchVolumeTableSkeleton />
            <RankingChartSkeleton />
          </section>
        </>
      ) : (
        <>
          {/* Ranking cards */}
          < DashboardRankingCard stats={stats} />

          {/* Keyword table and additional sections */}
          <section className="row gy-4 mt-8">
            <SearchVolumeTable top_sv={topKeywords} />
            <RankingChart chartData={chartData} />
          </section>
        </>
      )}
    </div>
  );
};

export default DashBoardLayerOne;
