import React, { useContext, useEffect, useState } from "react";
import { Table, Tabs, Tooltip } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import {
  exportKeywordRankingCsv,
  exportRawKeywordRankingCsv,
  exportUrlRankingCsv,
  getAllTasks,
  getExcel,
  getProjects,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";
import "../../styles/KeywordsRanking.css";
import { Spinner } from "react-bootstrap";

const { TabPane } = Tabs;

const Index = () => {
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
  const [searchVolume, setSearchVolume] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportMainLoading, setExportMainLoading] = useState(false)

  const { user } = useContext(AuthContext);

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    startDate: "",
    endDate: "",
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    result_type: "",
    user: "",
  });
  const [selectedProjectId, setSelectedProjectId] = useState(filter.project);
  const [projectUser, setProjectUser] = useState(filter.user);

  const tabs = {
    keyword: "Keyword Ranking",
    url: "URL Ranking",
  };

  const resultType = [
    { key: "organic", value: "Organic" },
    { key: "paid", value: "Paid" },
    { key: "people_also_search", value: "People also search" },
    { key: "link_element", value: "Link element" },
    { key: "people_also_ask_expanded_element", value: "People also ask" },
    { key: "local_pack", value: "Local pack" },
    { key: "ai_overview_reference", value: "AI overview" },
  ];

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
      const res = await getProjects({ user: projectUser });
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
  }, [
    filter, currentPage, activeKey]
  );

  // Build columns once uniqueDates or tab changes
  useEffect(() => {
    if (activeKey === "1" && uniqueDates.length > 0) {
      const dynamicColumns = [
        { title: "Keyword", dataIndex: "keyword", key: "keyword" },
        { title: "SV", dataIndex: "search_volume", key: "search_volume" },
        ...uniqueDates.map((date) => ({
          title: moment(date, "YYYY/MM/DD").format("DD MMM, YYYY"),
          dataIndex: date,
          key: date,
          render: (rank) => rank || "",
        })),
      ];
      setColumns(dynamicColumns);
    } else if (activeKey === "2" && uniqueDates.length > 0) {
      const dynamicColumns = [
        {
          title: "URL",
          dataIndex: "url",
          key: "url",
          render: (url) => {
            const i = url.indexOf("#");
            const displayUrl = i >= 0 ? url.slice(0, i + 1) : url;

            return (
              <a
                href={url}
                title={url} // full URL on hover
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  maxWidth: 300, // adjust column fit
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  verticalAlign: "middle",
                }}
              >
                {displayUrl}
              </a>
            );
          },
        },

        ...uniqueDates.map((date) => ({
          title: moment(date, "YYYY/MM/DD").format("DD MMM, YYYY"),
          dataIndex: date,
          key: date,
          render: (rank) => rank || 101,
        })),
      ];
      setUrlColumns(dynamicColumns);
    }
  }, [activeKey, uniqueDates]);

  const getEC = async (excelFilters = {}) => {
    try {
      const res = await getExcel(selectedProjectId, excelFilters);
      const { subCategories } = res.data.metadata || {};

      setSubCategory(subCategories || []);
    } catch (err) {
      console.error("Error fetching dependent metadata:", err);
    }
  };

  const loadBaseMetadata = async () => {
    try {
      const res = await getExcel(selectedProjectId);
      const { brands, categories } = res.data.metadata || {};

      setAllBrands(brands || []);
      setAllCategories(categories || []);
      setCategories(categories || []);
    } catch (err) {
      console.error("Failed to load base metadata", err);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      getEC();
      loadBaseMetadata()
    }
  }, [selectedProjectId]);


  useEffect(() => {
    if (!selectedProjectId) return;

    if (!filter.brand) {
      // reset to all
      setCategories(allCategories);
      getEC();
      return;
    }

    // fetch categories & subCategories for selected brand
    (async () => {
      try {
        const res = await getExcel(selectedProjectId, {
          brand: filter.brand,
        });

        const { categories, subCategories } = res.data.metadata || {};
        setCategories(categories || []);
        setSubCategory(subCategories || []);
      } catch (err) {
        console.error("Error updating brand filters", err);
      }
    })();
  }, [filter.brand, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    getEC({
      brand: filter.brand || undefined,
      category: filter.category || undefined,
    });
  }, [filter.brand, filter.category, selectedProjectId]);

  const fetchTasks = async (page = 1, activeTabKey) => {
    setLoading(true)
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
        ...(filter.result_type && { result_type: filter.result_type }),
        ...(filter.category && { category: filter.category }),
        ...(filter.subCategory && { subCategory: filter.subCategory }),
        ...(filter.brand && { brand: filter.brand }),
      };

      const response = await getAllTasks(page, 10, baseQuery);

      if (activeTabKey === "1") {
        setTasks(response.data.tasks || []);
      } else {
        setUrlTasks(response.data.tasks || []);
      }

      setSearchVolume(response.data.searchVolume || []);
      setTotalPages(response.data.totalPages || 0);
      setUniqueDates(response.data.uniqueDates || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false)
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

  const exportData = async () => {
    setExportMainLoading(true)
    try {
      const exportFilter = {
        ...(activeKey === "1" && filter.keyword && { keyword: filter.keyword }),
        ...(activeKey === "2" && filter.url && { url: filter.url }),
        ...(filter.project && { project: filter.project }),
      };

      let blob, filename;
      if (activeKey === "1") {
        blob = await exportKeywordRankingCsv(exportFilter);
        filename = "keyword_ranking_export.csv";
      } else {
        blob = await exportUrlRankingCsv(exportFilter);
        filename = "url_ranking_export.csv";
      }

      if (typeof blob === "string") {
        blob = new Blob([blob], { type: "text/csv" });
      } else if (blob?.data) {
        blob = new Blob([blob.data], { type: "text/csv" });
      } else if (!(blob instanceof Blob)) {
        throw new Error("Invalid blob format for export");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setExportMainLoading(false)
      console.error("Export error:", error);
    } finally {
      setExportMainLoading(false)
    }
  };

  const exportRawData = async () => {
    setExportLoading(true)
    try {
      const { startDate, endDate } = filter;
      const formattedStart = startDate
        ? dayjs(startDate).format("YYYY-MM-DD")
        : "";
      const formattedEnd = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

      const exportFilter = {
        ...(activeKey === "1" && filter.keyword && { keyword: filter.keyword }),
        ...(activeKey === "2" && filter.url && { url: filter.url }),
        ...(filter.project && { project: filter.project }),
        ...(formattedStart &&
          formattedEnd && {
          startDate: formattedStart,
          endDate: formattedEnd,
        }),
      };

      let blob, filename;
      if (activeKey === "1") {
        blob = await exportRawKeywordRankingCsv(exportFilter);
        filename = "keyword_ranking_export.csv";
      } else {
        blob = await exportUrlRankingCsv(exportFilter);
        filename = "url_ranking_export.csv";
      }

      if (typeof blob === "string") {
        blob = new Blob([blob], { type: "text/csv" });
      } else if (blob?.data) {
        blob = new Blob([blob.data], { type: "text/csv" });
      } else if (!(blob instanceof Blob)) {
        throw new Error("Invalid blob format for export");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      setExportLoading(false)
    } finally {
      setExportLoading(false)
    }
  };

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Ranking Report
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
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* BRAND */}
            <div className="col-md-3">
              <label htmlFor="brandSelect" className="form-label fw-semibold">
                Brand
              </label>
              <select
                id="brandSelect"
                className="form-control"
                value={filter.brand}
                onChange={(e) => {
                  const value = e.target.value
                  setFilter((prev) => ({
                    ...prev,
                    brand: value,
                    category: "",
                    subCategory: "",
                  }))
                }
                }
              >
                <option value="">All</option>
                {/* {brands.map((b, idx) => (
                  <option key={idx} value={b}>
                    {b}
                  </option>
                ))} */}

                {allBrands.map((b, i) => (
                  <option key={i} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}
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
                onChange={(e) => {
                  const value = e.target.value
                  setFilter((prev) => ({
                    ...prev,
                    category: value,
                    subCategory: "",
                  }))

                }}
              >
                <option value="">All</option>
                {categories.map((c, i) => (
                  <option
                    key={i}
                    value={c}
                    style={{
                      fontWeight: filter.category === c ? "600" : "normal",
                    }}
                  >
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORY */}
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
                onChange={(e) => {
                  const value = e.target.value
                  setFilter((prev) => ({
                    ...prev,
                    subCategory: value,
                  }))
                }}
              >
                <option value="">All</option>
                {subCategory.map((sc, idx) => (
                  <option key={idx} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            {/* RESULT TYPE */}
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
                value={filter.result_type}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    result_type: e.target.value,
                  }))
                }
              >
                <option value="">Organic</option>
                {/* {resultType.map((rt) => (
                  <option key={rt.key} value={rt.key}>
                    {rt.value}
                  </option>
                ))} */}
              </select>
            </div>

            {/* START DATE */}
            <div className="col-md-4">
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
                    startDate: e.target.value || "",
                  }));
                }}
              />
            </div>

            {/* END DATE */}
            <div className="col-md-4">
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
                    endDate: e.target.value || "",
                  }));
                }}
              />

            </div>

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

            {/* export */}
            {/* <div className="col-md-3 align-items-end pt-6">
              <button
                className="btn btn-secondary w-100"
                onClick={exportData}
              >
                {exportMainLoading ? "Exporting..." : "Export"}
              </button>
            </div> */}

            {/* export raw data */}
            <div className="col-md-3 align-items-end pt-6">
              <button
                className="btn btn-secondary w-100"
                onClick={exportRawData}
              >
                {exportLoading ? "Exporting..." : "Export Raw"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ───── WRAP TABS INSIDE A SINGLE TABLE CARD ───── */}
      {loading ? (
        <div className="text-center p-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="card shadow-sm mt-20">
          {/* Card Header: contains the nav-pills (tabs) */}
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

          {/* Card Body: contains the tab-content with the appropriate table */}
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
                <Table
                  className="custom-table"
                  rowKey="_id"
                  columns={columns}
                  dataSource={tasks}
                  scroll={{ x: "max-content" }}
                  pagination={{
                    pageSize: 10,
                    current: currentPage,
                    total: totalPages * 10,
                    showSizeChanger: false,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  expandable={{
                    expandedRowKeys,
                    onExpand: handleExpand,
                    rowExpandable: (record) =>
                      record.children && record.children.length > 0,
                  }}
                />

                {/* <table className="table custom-table" style={{ border: "1px solid #ddd" }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{
                        width: "30%",
                        color: "#333333",
                        padding: "14px 20px",
                      }}>Keyword</th>
                      {uniqueDates.map((d) => (
                        <th key={d} className="text-center" style={{ color: "#333333", padding: "14px 20px" }}>
                          {moment(d, "YY/MM/DD").format("DD MMM, YYYY")}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {tasks.map((row) => {
                      const expanded = expandedRowKeys.includes(row._id);
                      const hasChildren = row.children?.length > 0;
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
                          <tr>
                            <td style={{ color: "#4B5563" }}>
                              {hasChildren && (
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
                              )}
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

                          {expanded &&
                            row.children?.length > 0 &&
                            row.children?.map((c) => (
                              <tr key={c._id} className="bg-light">
                                <td style={{
                                  paddingLeft: 40,
                                  color: "#4b5563",
                                }}>
                                  <a
                                    href={c.url}
                                    title={c.url}
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
                                      const i = c.url.indexOf("#");
                                      return i >= 0
                                        ? c.url.slice(0, i + 1)
                                        : c.url;
                                    })()}                                  </a>
                                </td>

                                {uniqueDates.map((d) => (
                                  <td key={d} className="text-center"
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
                </table> */}
                {/* <nav className="d-flex justify-content-center mt-3">
                  <ul className="pagination mb-0 flex-wrap">
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
                </nav> */}
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
                <Table
                  className="custom-table"
                  rowKey={(record) =>
                    record._id || `${record.parentId}-${record.url}`
                  }
                  columns={urlColumns}
                  dataSource={urlTasks}
                  scroll={{ x: "max-content" }}
                  pagination={{
                    pageSize: 10,
                    current: currentPage,
                    total: totalPages * 10,
                    showSizeChanger: false,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  expandable={{
                    expandedRowKeys: urlExpandedRowKeys,
                    onExpand: handleUrlExpand,
                    rowExpandable: (record) =>
                      record.children && record.children.length > 0,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;