import React, { useContext, useEffect, useState } from "react";
import { Spin, Table, Tabs } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import {
  exportExcel,
  exportKeywordRankingCsv,
  exportUrlRankingCsv,
  getAIModeProjects,
  getDailyRankingAIReport,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";
import "../../styles/KeywordsRanking.css";
import { Spinner } from "react-bootstrap";

const DailyRankingDashboard = () => {

  const [brands, setBrands] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [urlTasks, setUrlTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeKey, setActiveKey] = useState("1");
  const [projects, setProjects] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [urlExpandedRowKeys, setUrlExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState([]);
  const [urlColumns, setUrlColumns] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false)
  

  const { user } = useContext(AuthContext);
  const userRole = user?.data?.user?.role || "";

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    startDate: "",
    endDate: "",
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    user: "",
  });



    const resultTypeOptions = [
    { key: "organic", label: "Organic" },
    { key: "paid", label: "Paid" },
    { key: "people_also_ask_expanded_element", label: "People also ask" },
    { key: "link_element", label: "Link element" },
    { key: "local_pack", label: "Local pack" },
    { key: "ai_overview_reference", label: "AI overview" },
  ];

  const [selectedProjectId, setSelectedProjectId] = useState(filter.project);
  const [projectUser, setProjectUser] = useState(filter.user);

  const tabs = {
    keyword: "Keyword Ranking",
    url: "URL Ranking",
  };

  // Fetch projects once user is known
  useEffect(() => {
    if (user) {
      setFilter((prev) => ({ ...prev, user: user?._id }));
      setProjectUser(user?._id);
    }
  }, [user]);

  useEffect(() => {
    if (projectUser) {
      fetchProjects();
    }
  }, [projectUser]);

  const fetchProjects = async () => {
    try {
      const res = await getAIModeProjects("Not Available");
      const fetched = res.data.projects || [];
      setProjects(fetched);

      if (fetched.length > 0 && !selectedProjectId) {
        const defaultProjectId = fetched[0]._id;
        setFilter((prev) => ({ ...prev, project: defaultProjectId }));
        setSelectedProjectId(defaultProjectId);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // Whenever filter, page, or tab changes, reload tasks
  useEffect(() => {
    if (filter.project) {
      fetchTasks(currentPage, activeKey);
    }
  }, [currentPage, activeKey, filter]);

  const safeDecode = (v) => {
    try {
      return decodeURIComponent(v || "").replace(/\+/g, " ");
    } catch {
      return v;
    }
  };

  // Build columns once uniqueDates or tab changes
  useEffect(() => {
    if (activeKey === "1" && uniqueDates.length > 0) {
      const dynamicColumns = [
        {
          title: "Keyword",
          dataIndex: "keyword",
          key: "keyword",
          // width:"400px",
          render: (val) => safeDecode(val),
        },
        ...uniqueDates.map((date) => ({
          title: moment(date, "YY/MM/DD").format("DD MMM, YYYY"),
          dataIndex: date,
          key: date,
          width: "400px",
          render: (rank) => rank || "NA",
        })),
      ];
      setColumns(dynamicColumns);
    } else if (activeKey === "2" && uniqueDates.length > 0) {
      const dynamicColumns = [
        { title: "URL", dataIndex: "url", key: "url" },
        ...uniqueDates.map((date) => ({
          title: moment(date, "YY/MM/DD").format("DD MMM, YYYY"),
          dataIndex: date,
          key: date,
          render: (rank) => rank || "NA",
        })),
      ];
      setUrlColumns(dynamicColumns);
    }
  }, [activeKey, uniqueDates]);

  const fetchTasks = async (page = 1, activeTabKey) => {
    setLoading(true);
    try {
      const { startDate, endDate } = filter;
      const formattedStart = startDate
        ? dayjs(startDate).format("YYYY-MM-DD")
        : "";
      const formattedEnd = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

      const baseQuery = {
        tab: activeTabKey === "1" ? "keywordRanking" : "urlRanking",
        ...(activeTabKey === "1" &&
          filter.keyword && {
          keyword: filter.keyword,
        }),
        ...(activeTabKey === "2" && filter.url && { url: filter.url }),
        ...(formattedStart &&
          formattedEnd && {
          startDate: formattedStart,
          endDate: formattedEnd,
        }),
        ...(filter.project && { project: filter.project }),
      };

      const response = await getDailyRankingAIReport(page, 10, baseQuery);

      if (activeTabKey === "1") {
        setTasks(response.data.tasks || []);
      } else {
        setUrlTasks(response.data.tasks || []);
      }

      setTotalPages(response.data.totalPages || 0);
      setUniqueDates(response.data.uniqueDates || []);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (expanded, record) => {
    const key = record._id;
    setExpandedRowKeys((prev) =>
      expanded ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  const handleUrlExpand = (expanded, record) => {
    const key = record._id;
    setUrlExpandedRowKeys((prev) =>
      expanded ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  useEffect(() => {
    if (!tasks) {
      setLoading(true);
    }
  }, [tasks]);

  const exportData = async () => {
    try {
      setExportLoading(true);

      const exportFilter = {
        ...(filter.keyword && { keyword: filter.keyword }),
        ...(filter.url && { url: filter.url }),
        ...(filter.project && { project: filter.project }),
      };

      const blob = await exportExcel(exportFilter); // <-- blob is returned
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ai_mode.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          AI Ranking Report
        </h6>
      </div>

      {/* ───── FILTER CARD ───── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* PROJECT */}
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
                  setCurrentPage(1);
                }}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* START DATE */}
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              {/* <input
                id="startDate"
                type="date"
                className="form-control"
                value={filter.startDate?.substring(0, 10) || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    startDate: e.target.value
                      ? dayjs(e.target.value).toISOString()
                      : "",
                  }));
                }}
              /> */}
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

            {/* END DATE */}
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              {/* <input
                id="endDate"
                type="date"
                className="form-control"
                value={filter.endDate?.substring(0, 10) || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    endDate: e.target.value
                      ? dayjs(e.target.value).toISOString()
                      : "",
                  }));
                }}
              /> */}

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





{/* ------------------------------------------------------ */}



 <div className="col-md-3">
              <label className="form-label fw-semibold">Brand</label>
              <select className="form-control" value={filter.brand} onChange={(e) => setFilter((prev) => ({ ...prev, brand: e.target.value }))}>
                <option value="">All</option>
                {brands.map((b, i) => <option key={i} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Category</label>
              <select className="form-control" value={filter.category} onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}>
                <option value="">All</option>
                {categoryOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Sub Category</label>
              <select className="form-control" value={filter.subCategory} onChange={(e) => setFilter((prev) => ({ ...prev, subCategory: e.target.value }))}>
                <option value="">All</option>
                {subCategoryOptions.map((sc, i) => <option key={i} value={sc}>{sc}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold">Type</label>
              <select className="form-control" value={filter.result_type} onChange={(e) => setFilter((prev) => ({ ...prev, result_type: e.target.value }))}>
                <option value="">All</option>
                {resultTypeOptions.map((rt) => <option key={rt.key} value={rt.key}>{rt.label}</option>)}
              </select>
            </div>




{/* ------------------------------------------------------------------ */}









            {/* RESET */}
            <div className="col-md-3 align-items-end pt-6">
              <button
                className="btn btn-secondary w-100"
                onClick={() =>
                  setFilter({
                    keyword: "",
                    url: "",
                    startDate: "",
                    endDate: "",
                    project: "",
                  })
                }
              >
                Reset
              </button>
            </div>

            {/* Export Button */}
            <div className="col-md-1 align-items-end pt-6">
              <button
                style={{
                  background: exportLoading ? "#bdc3c7" : "#487fff",
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
                }}
                disabled={exportLoading}
                onClick={exportData}
              >
                {exportLoading ? (
                  <>
                    <span
                      style={{
                        fontWeight: "600px",
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
          </div>
        </div>
      </div>

      {/* ───── WRAP TABS INSIDE A SINGLE TABLE CARD ───── */}


      {/* Card Header: contains the nav-pills (tabs) */}
      {loading ? (
        <div className="text-center p-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="card shadow-sm mt-20">

          <div className="card-header py-8 px-24 bg-base border border-end-0 border-start-0 border-top-0">
            <ul className="nav focus-tab nav-pills mb-0" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={
                    "nav-link fw-semibold text-primary-light radius-4 px-16 py-10 " +
                    (activeKey === "1" ? "active" : "")
                  }
                  id="pills-focus-home-tab"
                  type="button"
                  role="tab"
                  aria-controls="pills-focus-home"
                  aria-selected={activeKey === "1"}
                  onClick={() => {
                    setActiveKey("1");
                    setCurrentPage(1);
                  }}
                >
                  {tabs.keyword}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={
                    "nav-link fw-semibold text-primary-light radius-4 px-16 py-10 " +
                    (activeKey === "2" ? "active" : "")
                  }
                  id="pills-focus-details-tab"
                  type="button"
                  role="tab"
                  aria-controls="pills-focus-details"
                  aria-selected={activeKey === "2"}
                  onClick={() => {
                    setActiveKey("2");
                    setCurrentPage(1);
                  }}
                >
                  {tabs.url}
                </button>
              </li>
            </ul>
          </div>


          <div className="card-body p-24 pt-10">
            <div className="tab-content" id="pills-tab-twoContent">
              {/* ── Pane for “Keyword Ranking” ── */}
              <div
                className={
                  "tab-pane fade " + (activeKey === "1" ? "show active" : "")
                }
                id="pills-focus-home"
                role="tabpanel"
                aria-labelledby="pills-focus-home-tab"
                tabIndex={0}
              >
                {/* Keyword table (Bootstrap + manual accordion) */}
                <table
                  className="table custom-table"
                  data-page-length="10"
                  style={{ border: "1px solid #ddd" }}
                >
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{
                          width: "30%",
                          color: "#333333",
                          padding: "14px 20px",
                        }}
                      >
                        Keyword
                      </th>
                      {uniqueDates.map((d) => (
                        <th
                          key={d}
                          className="text-center"
                          style={{ color: "#333333", padding: "14px 20px" }}
                        >
                          {moment(d, "YY/MM/DD").format("DD MMM, YYYY")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks
                      // .slice((currentPage - 1) * 10, currentPage * 10)
                      .map((row) => {
                        const hasChildren =
                          Array.isArray(row.children) && row.children.length > 0;
                        const expanded = expandedRowKeys.includes(row._id);
                        const colSpan = uniqueDates.length + 1;
                        const decode = (v) => {
                          try {
                            return decodeURIComponent(v || "").replace(
                              /\+/g,
                              " "
                            );
                          } catch {
                            return v;
                          }
                        };
                        return (
                          <React.Fragment key={row._id}>
                            {/* parent row */}
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
                                {decode(row.keyword)}
                              </td>

                              {uniqueDates.map((d) => {
                                return (
                                  <td
                                    key={d}
                                    className="text-center"
                                    style={{
                                      color: "#4b5563",
                                      paddingTop: "16px",
                                    }}
                                  >
                                    {row[d] === 101 || row[d] === ""
                                      ? "NA"
                                      : row[d]}
                                  </td>
                                )
                              })}
                            </tr>

                            {/* children rows directly below, aligned with parent */}
                            {expanded &&
                              row.children?.length > 0 &&
                              row.children.map((c) => (
                                <tr key={c._id} className="bg-light">
                                  <td
                                    style={{
                                      paddingLeft: "40px",
                                      color: "#4b5563",
                                    }}
                                  >
                                    <a
                                      href={c.keyword}
                                      title={c.keyword}
                                      target="_blank"
                                      rel="noopener noreferrer"
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
                                      })()}
                                    </a>
                                  </td>

                                  {uniqueDates.map((d) => (
                                    <td
                                      key={d}
                                      className="text-center"
                                      style={{
                                        padding: "16px",
                                        color: "#4b5563",
                                      }}
                                    >
                                      {c[d] === 101 || c[d] === "" ? "" : c[d]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>

                <nav className="d-flex justify-content-center mt-3">
                  <ul className="pagination mb-0 flex-wrap">
                    {/* Prev button */}
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          currentPage > 1 && setCurrentPage(currentPage - 1)
                        }
                      >
                        ‹
                      </button>
                    </li>

                    {/* Show limited page numbers */}
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
                            className={`page-item ${currentPage === p ? "active" : ""
                              }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(p)}
                            >
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
                          currentPage < totalPages &&
                          setCurrentPage(currentPage + 1)
                        }
                      >
                        ›
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* ── Pane for “URL Ranking” ── */}
              <div
                className={
                  "tab-pane fade " + (activeKey === "2" ? "show active" : "")
                }
                id="pills-focus-details"
                role="tabpanel"
                aria-labelledby="pills-focus-details-tab"
                tabIndex={0}
              >
                <table
                  className="table custom-table"
                  data-page-length="10"
                  style={{ border: "1px solid #ddd" }}
                >
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{
                          width: "40%",
                          color: "#333333",
                          padding: "14px 20px",
                        }}
                      >
                        URL
                      </th>
                      {uniqueDates.map((d) => (
                        <th
                          key={d}
                          className="text-center"
                          style={{ color: "#333333", padding: "14px 20px" }}
                        >
                          {moment(d, "YY/MM/DD").format("DD MMM, YYYY")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {urlTasks
                      // .slice((currentPage - 1) * 10, currentPage * 10)
                      .map((row) => {
                        const expanded = urlExpandedRowKeys.includes(row._id);
                        const colSpan = uniqueDates.length + 1;
                        return (
                          <React.Fragment key={row._id || `${row.parentId}-${row.url}`}>
                            {/* parent URL */}
                            <tr>
                              <td
                                style={{
                                  color: "#4B5563",
                                  padding: "14px 20px",
                                  width: "40%", // ✅ fix alignment
                                }}
                              >
                                <button
                                  type="button"
                                  className="btn btn-link p-0 me-2 text-decoration-none"
                                  onClick={() => handleUrlExpand(!expanded, row)}
                                  aria-expanded={expanded}
                                  aria-controls={`url-child-${row._id}`}
                                  style={{ lineHeight: 1 }}
                                >
                                  <div
                                    style={{
                                      color: "#222222",
                                      fontSize: "28px",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {expanded ? "▾" : "▸"}
                                  </div>
                                </button>

                                <a
                                  href={row.url}
                                  title={row.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-block",
                                    maxWidth: 300,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {(() => {
                                    const i = row.url.indexOf("#");
                                    return i >= 0 ? row.url.slice(0, i + 1) : row.url;
                                  })()}
                                </a>
                              </td>

                              {uniqueDates.map((d) => (
                                <td
                                  key={d}
                                  className="text-center"
                                  style={{
                                    color: "#4b5563",
                                    padding: "14px 0px",
                                    width: `${60 / uniqueDates.length}%`, // ✅ evenly distribute width
                                  }}
                                >
                                  {row[d] === 101 || row[d] === "" ? "NA" : row[d]}
                                </td>
                              ))}
                            </tr>

                            {/* children keywords */}
                            {expanded && row.children?.length > 0 && (
                              <tr id={`url-child-${row._id}`} className="bg-light">
                                <td colSpan={colSpan} className="p-0">
                                  <table className="table table-sm mb-0 custom-table" style={{ width: "100%" }}>
                                    <tbody>
                                      {row.children.map((c) => (
                                        <tr key={c._id}>
                                          <td
                                            style={{
                                              padding: "14px 48px",
                                              width: "40%", // ✅ same width as parent
                                              color: "#4b5563",
                                            }}
                                          >
                                            {c.keyword}
                                          </td>

                                          {uniqueDates.map((d) => (
                                            <td
                                              key={d}
                                              className="text-center"
                                              style={{
                                                padding: "16px",
                                                width: `${60 / uniqueDates.length}%`, // ✅ match parent width
                                                color: "#4b5563",
                                              }}
                                            >
                                              {c[d] === 101 || c[d] === "" ? "" : c[d]}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>

                        );
                      })}
                  </tbody>
                </table>

                {/* pagination */}
                {/* <nav className="d-flex justify-content-end">
                <ul className="pagination mb-0">
                  <li
                    className={
                      "page-item " + (currentPage === 1 ? "disabled" : "")
                    }
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        currentPage > 1 && setCurrentPage(currentPage - 1)
                      }
                    >
                      ‹
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <li
                        key={p}
                        className={
                          "page-item " + (currentPage === p ? "active" : "")
                        }
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      </li>
                    )
                  )}
                  <li
                    className={
                      "page-item " +
                      (currentPage === totalPages ? "disabled" : "")
                    }
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        currentPage < totalPages &&
                        setCurrentPage(currentPage + 1)
                      }
                    >
                      ›
                    </button>
                  </li>
                </ul>
              </nav> */}
                <nav className="d-flex justify-content-center mt-3">
                  <ul className="pagination mb-0 flex-wrap">
                    {/* Prev button */}
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          currentPage > 1 && setCurrentPage(currentPage - 1)
                        }
                      >
                        ‹
                      </button>
                    </li>

                    {/* Show limited page numbers */}
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
                            className={`page-item ${currentPage === p ? "active" : ""
                              }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(p)}
                            >
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
                          currentPage < totalPages &&
                          setCurrentPage(currentPage + 1)
                        }
                      >
                        ›
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyRankingDashboard;
