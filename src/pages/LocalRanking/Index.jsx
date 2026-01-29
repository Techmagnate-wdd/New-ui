import React, { useContext, useEffect, useState, useCallback } from "react";
import { Table, Input, DatePicker, Select, Link } from "antd";
import {
  exportLocalRanking,
  getLocalExcel,
  getLocalProjects,
  getLocalRanking,
} from "../../services/api";
// import "../../styles/RankingReport.css";
import moment from "moment";
import AuthContext from "../../context/AuthContext";
import { Spinner } from "react-bootstrap";

const { Option } = Select;
const { RangePicker } = DatePicker;

const LocalRanking = () => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";
  const userId = user?._id;

  // State management
  const [tasks, setTasks] = useState([]);
  const [urlTasks, setUrlTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [urlExpandedRowKeys, setUrlExpandedRowKeys] = useState([]);
  const [activeKey, setActiveKey] = useState("1");
  const [projects, setProjects] = useState([]);
  const [brands, setBrands] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state - consolidated into a single state object
  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    dateRange: [],
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    user: "",
  });

  // Fetch projects when user ID is available
  useEffect(() => {
    if (userId) {
      setFilter((prev) => ({ ...prev, user: userId }));
      fetchProjects(userId);
    }
  }, [userId]);

  // Set initial project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !filter.project) {
      const defaultProjectId =
        userRole === "admin" ? "6838457cbd049c1fba0ff9c7" : projects[0]?._id;

      if (defaultProjectId) {
        setFilter((prev) => ({ ...prev, project: defaultProjectId }));
      }
    }
  }, [projects, filter.project, userRole]);

  // Fetch tasks only when project is selected and on filter/page changes
  useEffect(() => {
    if (filter.project) {
      fetchTasks(currentPage, activeKey);
    }
  }, [filter.keyword, filter.endDate, filter.project, filter.brand, filter.category, filter.subCategory, currentPage]);

  // Fetch category data when project is selected
  useEffect(() => {
    if (filter.project) {
      fetchCategoryData();
    }
  }, [filter.project]);

  useEffect(() => {
    if (uniqueDates.length > 0) {
      let dynamicColumns = [
        {
          title: "Keyword",
          dataIndex: "keyword",
          key: "keyword",
          fixed: "left",
        },
        ...uniqueDates.map((date) => {
          return ({
            title: moment(date, "YY/MM/DD").format("DD MMM, YYYY"),
            children: [
              {
                title: "Ranking",
                key: `${date}-rank`,
                render: (record) => {
                  return record[date]?.rank || ""
                },
              },
              {
                title: "Rating",
                key: `${date}-rating`,
                render: (record) => record[date]?.rating || "",
              },
            ],
          })
        }),
      ];

      setColumns(dynamicColumns);
    }
  }, [uniqueDates]);

  // Memoized fetch functions
  const fetchProjects = useCallback(async (userId) => {
    try {
      const { data } = await getLocalProjects({ user: userId });
      setProjects(data.projects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  const fetchTasks = useCallback(
    async (page = 1, activeTabKey) => {
      setLoading(true)
      try {
        const startDate = filter.startDate
          ? moment(filter.startDate).startOf("day").format("YYYY-MM-DD")
          : "";

        const endDate = filter.endDate
          ? moment(filter.endDate).endOf("day").format("YYYY-MM-DD")
          : "";

        const filteredQuery = {
          ...(filter.keyword && { keyword: filter.keyword }),
          ...(startDate && endDate && { startDate, endDate }),
          ...(filter.project && { project: filter.project }),
          ...(filter.category && { category: filter.category }),
          ...(filter.subCategory && { subCategory: filter.subCategory }),
          ...(filter.brand && { brand: filter.brand }),
        };

        const response = await getLocalRanking(page, 10, filteredQuery);

        if (activeTabKey === "1") {
          setTasks(response.data.tasks || []);
        } else {
          setUrlTasks(response.data.tasks || []);
        }
        setColumns(response.data.columns);
        setUniqueDates(response.data.uniqueDates);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
      finally {
        setLoading(false)
      }
    },
    [filter]
  );

  const fetchCategoryData = useCallback(async () => {
    try {
      const { data } = await getLocalExcel(filter.project, filter);
      setBrands([...new Set(data.tasks.map((d) => d.Brand))]);
      setCategory([...new Set(data.tasks.map((d) => d.Category))]);
      setSubCategory([...new Set(data.tasks.map((d) => d.SubCategory))]);
    } catch (err) {
      console.error("Error fetching category data:", err);
    }
  }, [filter]);

  // Export data handler
  const exportData = async () => {
    setExportLoading(true)
    try {
      const response = await exportLocalRanking(filter);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "local_ranking.xlsx"); // corrected file extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // free memory
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false)
    }
  };

  // Row expansion handler
  const handleExpand = (expanded, record) => {
    const key = record._id;
    setExpandedRowKeys((prev) =>
      expanded ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  // Reset filter handler
  const resetFilters = () => {
    setFilter({
      keyword: "",
      url: "",
      startDate: "",
      endDate: "",
      project:
        userRole === "admin"
          ? "6838457cbd049c1fba0ff9c7"
          : projects[0]?._id,
      brand: "",
      category: "",
      subCategory: "",
      user: userId,
    });
    setCurrentPage(1);
  };

  const renderPagination = () => (
    <nav className="d-flex justify-content-center mt-3">
      <ul className="pagination mb-0 flex-wrap">
        {/* Prev button */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() =>
              currentPage > 1 && setCurrentPage(currentPage - 1)
            }
          >
            ‹
          </button>
        </li>

        {/* Limited page numbers with ellipsis */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              (p >= currentPage - 2 && p <= currentPage + 2)
          )
          .map((p, index, array) => (
            <React.Fragment key={p}>
              {index > 0 && array[index - 1] !== p - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">…</span>
                </li>
              )}
              <li
                className={`page-item ${currentPage === p ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(p)}>
                  {p}
                </button>
              </li>
            </React.Fragment>
          ))}

        {/* Next button */}
        <li
          className={`page-item ${currentPage === totalPages ? "disabled" : ""
            }`}
        >
          <button
            className="page-link"
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Local Ranking
        </h6>
      </div>

      {/* ───── FILTER CARD ───── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* project */}
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
                  setCurrentPage(1);
                }}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="col-md-3">
              <label htmlFor="brandSelect" className="form-label fw-semibold">
                Brand
              </label>
              <select
                id="brandSelect"
                placeholder="Filter by Brand"
                className="form-control"
                value={filter.brand}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, brand: val }));
                  setCurrentPage(1);
                }}
              >
                <option value="">All</option>
                {brands.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-md-3">
              <label htmlFor="categorySelect" className="form-label fw-semibold">
                Category
              </label>
              <select
                id="categorySelect"
                placeholder="Category"
                className="form-control"
                value={filter.category}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, category: val }));
                  setCurrentPage(1);
                }}
              >
                <option value="">All</option>
                {category.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category Filter */}
            <div className="col-md-3">
              <label htmlFor="subcategorySelect" className="form-label fw-semibold">
                Sub Category
              </label>
              <select
                id="subcategorySelect"
                placeholder="Sub Category"
                value={filter.subCategory}
                className="form-control"
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, subCategory: val }));
                  setCurrentPage(1);
                }}
              >
                <option value="">All</option>
                {subCategory.map((item, index) => {

                  return (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={filter.startDate || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    startDate: e.target.value, // just "2025-07-28"
                  }));
                }}
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control"
                value={filter.endDate || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    endDate: e.target.value, // just "2025-07-28"
                  }));
                }}
              />
            </div>

            {/* Keyword Search */}
            <div className="col-md-3">
              <label htmlFor="subcategorySelect" className="form-label fw-semibold">
                Search
              </label>
              <input
                id="keywordSearch"
                className="form-control"
                placeholder="Search by keyword"
                value={filter.keyword}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, keyword: val }));
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Export Button */}
            <div className="col-md-1 align-items-end pt-6">
              <button
                style={{
                  background: exportLoading ? "#bdc3c7" : "#2980b9",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: exportLoading ? "not-allowed" : "pointer",
                  opacity: exportLoading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontWeight: "500px"
                }}
                disabled={exportLoading}
                onClick={exportData}
              >
                {exportLoading ? (
                  <>
                    <span
                      style={{
                        border: "2px solid #f3f3f3",
                        borderTop: "2px solid #2980b9",
                        borderRadius: "50%",
                        width: "14px",
                        height: "14px",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Exporting...
                  </>
                ) : (
                  "Export"
                )}
              </button>
            </div>

            {/* Reset Button */}
            <div className={`${exportLoading ? "col-md-1" : "col-md-2"} align-items-end pt-6 `}>
              <span>&nbsp;</span>
              <button
                className="btn btn-secondary w-100"
                style={{
                  // background: "#2980b9",
                  background: "gray",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginLeft: exportLoading ? "40px" : ""
                }}
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-20">
        {loading ? (
          <div className="text-center py-5">
            <Spinner size="large" />
          </div>
        ) : (
          <div className="card-body p-24 pt-10">
            <div className="tab-content" id="pills-tab-twoContent">
              {/* ── Keyword Ranking Tab ── */}
              <div className="tab-pane show active">
                <table className="table custom-table"
                  style={{ border: "1px solid #ddd" }}
                >
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{
                          width: "30%",
                          color: "#333333",
                          padding: "14px 20px",
                        }}                      >Keyword</th>
                      {uniqueDates.map((d) => (
                        <th key={d} className="text-center"
                          style={{ color: "#333333", padding: "14px 20px" }}
                        >
                          {moment(d, "YY/MM/DD").format("DD MMM, YYYY")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((row) => {
                      const expanded = expandedRowKeys.includes(row._id);
                      return (
                        <React.Fragment key={row._id}>
                          <tr>
                            <td style={{ color: "#4B5563" }}>
                              <button
                                type="button"
                                className="btn btn-link text-decoration-none"
                                onClick={() => handleExpand(!expanded, row)}
                                aria-expanded={expanded}
                                aria-controls={`kw-child-${row._id}`}
                                style={{ lineHeight: 1 }}
                              >
                                <div
                                  style={{
                                    color: "#222222",
                                    fontSize: "20px",
                                    lineHeight: 1,
                                    marginRight: "8px",
                                  }}
                                >
                                  {expanded ? "▾" : "▸"}
                                </div>
                              </button>
                              {decodeURIComponent(row.keyword || "")}
                            </td>
                            {uniqueDates.map((d) => {
                              const cellData = row[d]; // object like { rank, rating }
                              return (
                                <td key={d} className="text-center"
                                  style={{
                                    color: "#4b5563",
                                    paddingTop: "16px",
                                  }}
                                >
                                  {cellData ? (
                                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                      <span>Rank: {cellData.rank === 101 || cellData.rank === "" ? "101" : cellData.rank}</span>
                                      <span>|</span>
                                      <span>Rating: {cellData.rating === "" || cellData.rating === "NA" ? "NA" : cellData.rating}</span>
                                    </div>
                                  ) : (
                                    "NA"
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Children Rows */}
                          {expanded &&
                            row.children?.map((c) => (
                              <tr key={c._id} className="bg-light">
                                <td style={{
                                  paddingLeft: "40px",
                                  color: "#4b5563",

                                }}>
                                  <a href={c.keyword}
                                    title={c.keyword}
                                    target="_blank" rel="noreferrer"
                                    style={{
                                      display: "inline-block",
                                      maxWidth: 380,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {(() => {
                                      const i = c.keyword.indexOf("#");
                                      return i >= 0
                                        ? c.keyword.slice(0, i + 1)
                                        : c.keyword;
                                    })()}                                  </a>
                                </td>
                                {uniqueDates.map((d) => {
                                  const childCellData = c[d]; // object { rank, rating }
                                  return (
                                    <td key={d} className="text-center"
                                      style={{
                                        padding: "16px",
                                        color: "#4b5563",
                                      }}
                                    >
                                      {/* {childCellData
                                      ? <>
                                        <div>Rank: {childCellData.rank === 101 || childCellData.rank === "" ? "" : childCellData.rank}</div>
                                        <div>Rating: {childCellData.rating ?? ""}</div>
                                      </>
                                      : ""} */}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>

                </table>
                {renderPagination()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default LocalRanking;
