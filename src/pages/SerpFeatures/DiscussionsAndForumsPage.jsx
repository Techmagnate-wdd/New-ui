import React, {
  useContext,
  useState,
} from "react";
import { Spinner } from "react-bootstrap";
import AuthContext from "../../context/AuthContext";
import FilterComponent from "./FilterComponent";
import DiscussionsAndForumsCard from "./DiscussionsAndForumsCard";

const DiscussionsAndForumsPage = () => {
  const { user } = useContext(AuthContext);

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    selectedDate: "",
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    result_type: "",
    user: "",
  });

  const [stats, setStats] = useState({
    totalKeywords: 0,
    totalSV: 0,
  });

  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const [loadingExcel, setLoadingExcel] = useState(false);

  // This callback is called whenever filters change
  const handleFilterChange = (newFilter) => {
    // You can perform additional actions here when filters change
    console.log("Filters changed:", newFilter);
  };


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
          {/* Featured Snippet card */}
          <DiscussionsAndForumsCard
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

export default DiscussionsAndForumsPage;