import React, { useContext, useEffect, useState } from "react";
import { Table } from "antd";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import moment from "moment";
import {
  getRankTracking,
  getProjects,
  getExcel,
  getExitRankTracking,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";
import { Spinner } from "react-bootstrap";

dayjs.extend(weekday);
dayjs.extend(localeData);

const RankTracker = () => {
  const [enteredData, setEnteredData] = useState({});
  const [exitedData, setExitedData] = useState({});
  const [columns, setColumns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("entered");
  const [enteredLoading, setEnteredLoading] = useState(false);
  const [exitedLoading, setExitedLoading] = useState(false);
  const [backendStartDate, setBackendStartDate] = useState()
  const [backendEndDate, setBackendEndDate] = useState()
  const [dateTouched, setDateTouched] = useState(false);

  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    dateRange: ["", ""],
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    result_type: "",
  });
  const [projectUser, setProjectUser] = useState(filter.user);
  const [selectedProjectId, setSelectedProjectId] = useState(filter.project);

  // const resultTypeOptions = [
  //   { key: "organic", value: "Organic" },
  //   { key: "paid", value: "Paid" },
  //   { key: "people_also_ask_expanded_element", value: "People also ask" },
  //   { key: "link_element", value: "Link element" },
  //   { key: "local_pack", value: "Local pack" },
  //   { key: "ai_overview_reference", value: "AI overview" },
  // ];

  // 1) When user becomes available, set filter.user and projectUser
  useEffect(() => {
    if (user) {
      const userId = user?._id;
      setFilter((prev) => ({ ...prev, user: userId }));
      setProjectUser(userId);
    }
  }, [user]);

  // 2) Fetch projects once projectUser is known
  useEffect(() => {
    if (projectUser) {
      fetchProjects();
    }
  }, [projectUser]);

  const fetchProjects = async () => {
    try {
      const res = await getProjects({ user: projectUser });
      const fetched = res.data.projects || [];
      setProjects(fetched);

      // Pick a default project if none selected yet
      if (fetched.length > 0 && !selectedProjectId) {
        const defaultProjectId = fetched[0]._id;
        setFilter((prev) => ({ ...prev, project: defaultProjectId }));
        setSelectedProjectId(defaultProjectId);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  function startOfDayUTC(dateStr) {
    return new Date(`${dateStr}T00:00:00.000Z`);
  }

  function endOfDayUTC(dateStr) {
    return new Date(`${dateStr}T23:59:59.999Z`);
  }

  // 3) Fetch rank data whenever filter changes
  useEffect(() => {
    if (!filter.project) return;
    fetchRankData();
  }, [
    filter.project,
    filter.keyword,
    filter.url,
    filter.result_type,
    filter.brand,
    filter.category,
    filter.subCategory,
    filter.dateRange?.[1]
  ]);

  // 4) Once a project is selected, fetch the Excel metadata
  useEffect(() => {
    if (selectedProjectId) {
      getExcelBaseMetadata();
    }
  }, [selectedProjectId]);

  const getExcelBaseMetadata = async () => {
    try {
      const res = await getExcel(selectedProjectId);
      const { brands, categories } = res.data.metadata || {};

      setBrands(brands || []);
      setCategories(categories || []);
      setSubCategories([]);
    } catch (err) {
      console.error("Error fetching base Excel metadata:", err);
    }
  };

  useEffect(() => {
    if (!filter.brand || !selectedProjectId) {
      setCategories([]);
      setSubCategories([]);
      return;
    }

    (async () => {
      const res = await getExcel(selectedProjectId, {
        brand: filter.brand,
      });
      const { categories, subCategories } = res.data.metadata || {};
      setCategories(categories || []);
      setSubCategories(subCategories || []);
    })();
  }, [filter.brand, selectedProjectId]);


  useEffect(() => {
    if (!filter.category || !selectedProjectId) {
      setSubCategories([]);
      return;
    }
    (async () => {
      const res = await getExcel(selectedProjectId, {
        brand: filter.brand,
        category: filter.category,
      });

      const { subCategories } = res.data.metadata || {};
      setSubCategories(subCategories || []);
    })();
  }, [filter.category, selectedProjectId]);

  const fetchRankData = async () => {
    try {
      // ✅ 1. Declare FIRST
      const [startDate, endDate] = filter.dateRange || [];

      const filteredQuery = {
        ...(filter.project && { project: filter.project }),
        ...(filter.keyword && { keyword: filter.keyword }),
        ...(filter.url && { url: filter.url }),
        ...(filter.result_type && { result_type: filter.result_type }),
        ...(filter.brand && { brand: filter.brand }),
        ...(filter.category && { category: filter.category }),
        ...(filter.subCategory && { subCategory: filter.subCategory }),
      };

      // ✅ 2. Use AFTER declaration
      if (dateTouched && startDate && endDate) {
        filteredQuery.startDate = startDate;
        filteredQuery.endDate = endDate;
      }

      console.log("Final payload →", filteredQuery);

      /* ---------- ENTERED ---------- */
      setEnteredLoading(true);

      const enteredResponse = await getRankTracking(filteredQuery);

      setEnteredLoading(false);

      const { startDate: s, endDate: e, data } = enteredResponse.data;

      setBackendStartDate(s);
      setBackendEndDate(e);

      setEnteredData(data || {});
      generateColumns(s, e);

      /* ---------- EXITED (NON BLOCKING) ---------- */
      setExitedLoading(true);

      getExitRankTracking(filteredQuery)
        .then((res) => {
          setExitedData(res.data?.data || {});
        })
        .catch((err) => {
          console.error("Exited rank fetch failed:", err);
        })
        .finally(() => {
          setExitedLoading(false);
        });

    } catch (err) {
      console.error("Error fetching entered rank data:", err);
      setEnteredLoading(false);
      setExitedLoading(false);
    }
  };

  const generateColumns = (startDate, endDate) => {
    setColumns([
      { title: "Keyword", dataIndex: "keyword", key: "keyword", width: 420 },
      {
        title: `${moment(endDate).format("DD MMM, YYYY")} (End Date)`,
        dataIndex: "endRank",
        key: "endRank",
        width: 350,
      },
      {
        title: `${moment(startDate).format("DD MMM, YYYY")} (Start Date)`,
        dataIndex: "startRank",
        key: "startRank",
        width: 350,
      },
    ]);
  };

  // Card style for each rank‐group table
  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    marginBottom: "16px",
  };

  // Render a card containing the "Entered" group table
  const renderEnteredTable = (rankGroup, title, dataObj) => {
    if (!dataObj[rankGroup] || !dataObj[rankGroup].keywords?.length)
      return null;

    return (
      <div key={rankGroup} className="card basic-data-table" style={cardStyle}>
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <Table
          className="custom-table"
          rowKey="keyword"
          columns={columns}
          dataSource={dataObj[rankGroup].keywords}
          pagination={{
            pageSize: 10,
            // showSizeChanger: true,
            // hideOnSinglePage: true,
          }}
        />
      </div>
    );
  };

  // Render a card containing the "Exited" group table
  const renderExitedTable = (rankGroup, title, dataObj) => {
    if (!dataObj[rankGroup] || !dataObj[rankGroup].keywords?.length)
      return null;

    return (
      <div key={rankGroup} className="card basic-data-table" style={cardStyle}>
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <Table
          className="custom-table"
          rowKey="keyword"
          columns={columns}
          dataSource={dataObj[rankGroup].keywords}
          // Uncomment below if you want no pagination:
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            position: ["bottomRight"],
            style: { marginTop: 16 },
            hideOnSinglePage: true,
          }}
        />
      </div>
    );
  };

  // Build the array of "Entered" cards
  const enteredTables = [
    { rank: "Rank 1", title: "Entered in Top 1" },
    { rank: "Rank 2-3", title: "Entered in Top 3" },
    { rank: "Rank 4-5", title: "Entered in Top 5" },
    { rank: "Rank 6-10", title: "Entered in Top 10" },
  ]
    .map(({ rank, title }) => renderEnteredTable(rank, title, enteredData))
    .filter((el) => el !== null);

  // Build the array of "Exited" cards
  const exitedTables = [
    { rank: "Rank 1", title: "Exit from Top 1" },
    { rank: "Rank 2-3", title: "Exit from Top 3" },
    { rank: "Rank 4-5", title: "Exit from Top 5" },
    { rank: "Rank 6-10", title: "Exit from Top 10" },
  ]
    .map(({ rank, title }) => renderExitedTable(rank, title, exitedData))
    .filter((el) => el !== null);

  // Handle tab switching
  const handleTabClick = (tabKey) => setActiveTab(tabKey);

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Keywords Movement
        </h6>
      </div>

      {/* ───── FILTER SECTION ───── */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* Project Selector */}
            <div className="col-md-3">
              <label htmlFor="projectSelect" className="form-label fw-semibold">
                Project
              </label>
              <select
                id="projectSelect"
                className="form-control"
                value={filter.project}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, project: val }));
                  setSelectedProjectId(val);
                }}
              >
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Selector */}
            <div className="col-md-3">
              <label htmlFor="brandSelect" className="form-label fw-semibold">
                Brand
              </label>
              <select
                id="brandSelect"
                className="form-control"
                value={filter.brand}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, brand: e.target.value }))
                }
              >
                <option value="">All</option>
                {brands.map((b, idx) => (
                  <option key={idx} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="col-md-3">
              <label
                htmlFor="categorySelect"
                className="form-label fw-semibold"
              >
                Category
              </label>
              <select
                id="categorySelect"
                className="form-control"
                value={filter.category}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">All</option>
                {categories?.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category Selector */}
            <div className="col-md-3">
              <label
                htmlFor="subCategorySelect"
                className="form-label fw-semibold"
              >
                Sub Category
              </label>
              <select
                id="subCategorySelect"
                className="form-control"
                value={filter.subCategory}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    subCategory: e.target.value,
                  }))
                }
              >
                <option value="">All</option>
                {subCategories?.map((sc, idx) => (
                  <option key={idx} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Selector */}
            <div className="col-md-2">
              <label
                htmlFor="resultTypeSelect"
                className="form-label fw-semibold"
              >
                Type
              </label>
              <select
                id="resultTypeSelect"
                className="form-control"
                // value={filter.result_type}
                value="Organic"
              // onChange={(e) =>
              //   setFilter((prev) => ({
              //     ...prev,
              //     result_type: e.target.value,
              //   }))
              // }
              >
                <option value="">Organic</option>
                {/* {resultTypeOptions.map((rt) => (
                  <option key={rt.key} value={rt.key}>
                    {rt.value}
                  </option>
                ))} */}
              </select>
            </div>

            {/* Start Date Picker */}
            <div className="col-md-5">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={filter.dateRange[0] || backendStartDate || ""}
                onChange={(e) => {
                  setDateTouched(true);
                  const newRange = [...filter.dateRange];
                  newRange[0] = e.target.value || ""
                  setFilter((prev) => ({ ...prev, dateRange: newRange }));
                  setActiveTab('entered')
                }}
              />
            </div>

            {/* End Date Picker */}
            <div className="col-md-5">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control"
                value={filter.dateRange[1] || backendEndDate || ""}
                onChange={(e) => {
                  setDateTouched(true);
                  const newRange = [...filter.dateRange];
                  newRange[1] = e.target.value || ""
                  setFilter((prev) => ({ ...prev, dateRange: newRange }));
                  setActiveTab('entered')
                }}
              />
            </div>

            {/* Reset Button */}
            <div className="col-md-3 align-items-end pt-6">
              <button
                className="btn btn-secondary w-100"
                onClick={() =>
                  setFilter({
                    keyword: "",
                    url: "",
                    dateRange: [null, null],
                    project: filter.project,
                    brand: "",
                    category: "",
                    subCategory: "",
                    result_type: "",
                  })
                }
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ───── TAB SWITCHER ───── */}
      <div className="mt-80">
        <button
          onClick={() => handleTabClick("entered")}
          style={{
            padding: "8px 16px",
            marginRight: "8px",
            background: activeTab === "entered" ? "#2980b9" : "#e0e0e0",
            color: activeTab === "entered" ? "#fff" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Rank Gains
        </button>
        <button
          onClick={() => handleTabClick("exited")}
          style={{
            padding: "8px 16px",
            background: activeTab === "exited" ? "#2980b9" : "#e0e0e0",
            color: activeTab === "exited" ? "#fff" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Rank Losses
        </button>
      </div>

      {/* ───── TABLE CONTAINER ───── */}
      <div className="mt-20">
        {/* ENTERED TAB */}
        {activeTab === "entered" && (
          enteredLoading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
            </div>
          ) : enteredTables.length ? (
            enteredTables
          ) : (
            <p>No data available for Rank Gains.</p>
          )
        )}

        {/* EXITED TAB */}
        {activeTab === "exited" && (
          exitedLoading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
            </div>
          ) : exitedTables.length ? (
            exitedTables
          ) : (
            <p>No data available for Rank Losses.</p>
          )
        )}
      </div>
    </div>
  );
};

export default RankTracker;
