import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import dayjs from "dayjs";
import { Spinner } from "react-bootstrap";

import {
  getExcel,
  getPeopleAlsoAskMetrics,
  getProjects,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";
import PAACard from "./PAACard";
import ImagesCard from "./ImagesCard";
import TopStoriesCard from "./TopStoriesCard";
import FilterComponent from "./FilterComponent";

const TopStoriesPage = () => {
  const { user } = useContext(AuthContext);

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    selectedDate: "",
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    user: "",
  });

  const [selectedProjectData, setSelectedProjectData] = useState()
  const [loadingExcel, setLoadingExcel] = useState(false);

  const [stats, setStats] = useState({
    totalKeywords: 0,
    totalSV: 0,
  });

  // This callback is called whenever filters change
  const handleFilterChange = (newFilter) => {
    // You can perform additional actions here when filters change
    console.log("Filters changed:", newFilter);
  };

  // ---- UI ----
  return (
    <div className="project-dashboard container1 py-4">
      <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
        SERP Features
      </h6>

      {/* Reusable Filter Component */}
      <FilterComponent
        user={user}
        filter={filter}
        setFilter={setFilter}
        onFilterChange={handleFilterChange}
        stats={stats}
        projectData={selectedProjectData}
        showStats={true}
      />

      {/* Cards section */}
      {loadingExcel ? (
        <div className="text-center p-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {/* 1️⃣ Featured Snippet card */}
          {/* <TopStoriesCard filter={filter} setTotalSV={setTotalSV} setTotalKeywords={setTotalKeywords} /> */}

          {/* AI Overview Snippet card */}
          <TopStoriesCard
            filter={filter}
            setTotalSV={(sv) => setStats((prev) => ({ ...prev, totalSV: sv }))}
            setTotalKeywords={(kw) =>
              setStats((prev) => ({ ...prev, totalKeywords: kw }))
            }
            setSelectedProjectData={setSelectedProjectData}
          />
        </>
      )}
    </div>
  );
};

export default TopStoriesPage;
