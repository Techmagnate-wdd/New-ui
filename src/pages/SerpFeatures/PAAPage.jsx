
// current filter optimization

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
import FilterComponent from "./FilterComponent";


const PAAPage = () => {
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

  const [stats, setStats] = useState({
    totalKeywords: 0,
    totalSV: 0,
  });

  const [selectedProjectData, setSelectedProjectData] = useState()
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [osData, setOsData] = useState("")

  const handleFilterChange = (newFilter) => {
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
          {/* <PAACard filter={filter} setTotalSV={setTotalSV} setTotalKeywords={setTotalKeywords} /> */}

          <PAACard
            filter={filter}
            setTotalSV={(sv) => setStats((prev) => ({ ...prev, totalSV: sv }))}
            setTotalKeywords={(kw) =>
              setStats((prev) => ({ ...prev, totalKeywords: kw }))
            }
            setOsData={setOsData}
            setSelectedProjectData={setSelectedProjectData}
          />
        </>
      )}
    </div>
  );
};

export default PAAPage;
