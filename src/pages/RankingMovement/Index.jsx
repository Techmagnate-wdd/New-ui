import React, { useContext, useEffect, useState } from "react";
import { Table } from "antd";
import {
  exportRankingDifferenceCsv,
  exportRankingDifferencePdf,
  getAllTaskNew,
  getExcel,
  getProjects,
} from "../../services/api";
import moment from "moment";
import AuthContext from "../../context/AuthContext";
import '../../styles/ExpandableAntd.css'
import { Spinner } from "react-bootstrap";
// import 'antd/dist/antd.css';


const RankingReportIndex = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [projects, setProjects] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState([]);
  const [formattedData, setFormattedData] = useState({
    data: [],
    uniqueDates: [],
  });
  const [brands, setBrands] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

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
    user: "",
  });
  const [projectUser, setProjectUser] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const resultTypeOptions = [
    { key: "organic", label: "Organic" },
    { key: "paid", label: "Paid" },
    { key: "people_also_search", label: "People also search" },
    { key: "link_element", label: "Link element" },
    { key: "people_also_ask_expanded_element", label: "People also ask" },
    { key: "local_pack", label: "Local pack" },
    { key: "ai_overview_reference", label: "AI overview" },
  ];

  // 1) When `user` becomes available, set filter.user and projectUser
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

      if (fetched.length > 0 && !selectedProjectId) {
        const defaultProjectId = fetched[0]._id;
        setFilter((prev) => ({ ...prev, project: defaultProjectId }));
        setSelectedProjectId(defaultProjectId);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // 3) Fetch tasks whenever filter or page changes, but only if project is set
  useEffect(() => {
    if (!filter.project) return;

    fetchTasks(currentPage);
  }, [
    filter.project,
    filter.keyword,
    filter.brand,
    filter.category,
    filter.subCategory,
    filter.result_type,
    filter.dateRange,
    currentPage,
  ]);

  // 4) After selecting a project, fetch Excel data
  useEffect(() => {
    if (selectedProjectId && filter.project === selectedProjectId) {
      getExcelData();
    }
  }, [selectedProjectId, filter.project]);

  const getExcelData = async () => {
    try {
      const res = await getExcel(selectedProjectId, filter);
      const tasksFromExcel = res.data.tasks || [];
      setBrands([...new Set(tasksFromExcel.map((d) => d.Brand))]);
      setCategoryOptions([...new Set(tasksFromExcel.map((d) => d.Category))]);
      setSubCategoryOptions([
        ...new Set(tasksFromExcel.map((d) => d.SubCategory)),
      ]);
    } catch (err) {
      console.error("Error fetching Excel data:", err);
    }
  };

  const fetchTasks = async (page = 1) => {
    // Build ISO date strings only if both exist
    const [startISO, endISO] = filter.dateRange;
    const startDate = startISO
      ? moment(startISO).startOf("day").format("YYYY-MM-DD")
      : "";
    const endDate = endISO
      ? moment(endISO).endOf("day").format("YYYY-MM-DD")
      : "";

    // If only one of the dates is set, skip the request
    if ((startISO && !endISO) || (!startISO && endISO)) {
      console.warn("Both start and end dates must be present—skipping fetch.");
      return;
    }

    const filteredQuery = {
      ...(filter.keyword && { keyword: filter.keyword }),
      ...(filter.url && { url: filter.url }),
      ...(startDate && endDate && { startDate, endDate }),
      project: filter.project, // always present in this branch
      ...(filter.result_type && { result_type: filter.result_type }),
      ...(filter.category && { category: filter.category }),
      ...(filter.subCategory && { subCategory: filter.subCategory }),
      ...(filter.brand && { brand: filter.brand }),
    };
    setLoading(true)
    try {

      const response = await getAllTaskNew(page, limit, filteredQuery);

      // ─── Normalize child rows into an array ───
      const rawRows = response.data.data || [];
      const uniqueDates = response.data.uniqueDates || [];
      setStartDate(uniqueDates[0])
      setEndDate(uniqueDates[1])
      const totalPagesFromApi = response.data.totalPages || 0;

      const normalizedRows = rawRows.map((row) => {
        if (row.children) {
          return {
            ...row,
            children: Array.isArray(row.children)
              ? row.children
              : [row.children],
          };
        }
        return row;
      });

      setTasks(response.data.tasks || []);
      setColumns(response.data.columns || []);
      setFormattedData({
        data: normalizedRows,
        uniqueDates,
      });
      setTotalPages(totalPagesFromApi);
    } catch (err) {
      setLoading(false)
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false)
    }
  };

  // 5) Rebuild columns whenever uniqueDates changes
  useEffect(() => {
    const { uniqueDates } = formattedData;

    if (!uniqueDates || uniqueDates.length !== 2) return;

    const dateColumns = uniqueDates.map((date) => ({
      title: moment(date).format("DD MMM YYYY"),
      dataIndex: date,
      key: date,
      width: 140,
      render: (value) => (
        <span>{value === "" ? "-" : value}</span>
      ),
    }));

    const dynamicColumns = [
      {
        title: "Keyword",
        dataIndex: "keyword",
        key: "keyword",
        width: 500,
        fixed: "left",
      },
      ...dateColumns,
      {
        title: "Difference",
        dataIndex: "difference",
        key: "difference",
        width: 300,
        render: (diff) => (
          <span
            style={{
              color:
                diff === "N/A"
                  ? "#999"
                  : diff < 0
                    ? "green"
                    : diff > 0
                      ? "red"
                      : "#333",
              fontWeight: 600,
            }}
          >
            {diff}
          </span>
        ),
      },
    ];

    setColumns(dynamicColumns);
  }, [formattedData.uniqueDates]);

  const handleExpand = (expanded, record) => {
    const key = record._id;
    setExpandedRowKeys((prev) =>
      expanded ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };


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


  const exportData = async () => {
    setExportLoading(true)
    try {
      // derive dates exactly like fetchTasks
      const [startISO, endISO] = filter.dateRange;

      const finalStartDate = startISO
        ? moment(startISO).startOf("day").format("YYYY-MM-DD")
        : startDate; // 👈 fallback to API-derived date

      const finalEndDate = endISO
        ? moment(endISO).endOf("day").format("YYYY-MM-DD")
        : endDate;   // 👈 fallback to API-derived date

      // SAFETY CHECK
      if (!finalStartDate || !finalEndDate) {
        console.warn("Export skipped: startDate or endDate missing");
        return;
      }

      const filteredQuery = {
        ...(filter.keyword && { keyword: filter.keyword }),
        ...(filter.url && { url: filter.url }),
        startDate: finalStartDate,
        endDate: finalEndDate,
        project: filter.project,
        ...(filter.result_type && { result_type: filter.result_type }),
        ...(filter.category && { category: filter.category }),
        ...(filter.subCategory && { subCategory: filter.subCategory }),
        ...(filter.brand && { brand: filter.brand }),
      };

      const response = await exportRankingDifferenceCsv(filteredQuery);

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ranking-difference.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      setExportLoading(false)
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false)
    }
  };


  const exportPdf = async () => {
    try {
      const [startISO, endISO] = filter.dateRange;
      const startDate = startISO
        ? moment(startISO).startOf("day").format("YYYY-MM-DD")
        : "";
      const endDate = endISO
        ? moment(endISO).endOf("day").format("YYYY-MM-DD")
        : "";

      const filteredQuery = {
        ...(filter.keyword && { keyword: filter.keyword }),
        ...(filter.url && { url: filter.url }),
        ...(startDate && endDate && { startDate, endDate }),
        project: filter.project,
        ...(filter.result_type && { result_type: filter.result_type }),
        ...(filter.category && { category: filter.category }),
        ...(filter.subCategory && { subCategory: filter.subCategory }),
        ...(filter.brand && { brand: filter.brand }),
      };

      const blob = await exportRankingDifferencePdf(filteredQuery);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "rank-difference.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleReset = () => {
    setFilter({
      keyword: "",
      url: "",
      dateRange: ["", ""],
      project: filter.project,
      brand: "",
      category: "",
      subCategory: "",
      result_type: "",
      user: filter?.user,
    });
    setSelectedProjectId("");
    setCurrentPage(1);
  };

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Ranking Movement
        </h6>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          {/* Row 1: Project | Brand | Category | Sub Category */}
          <div className="row gx-3 gy-3 align-items-end">
            <div className="col-md-3">
              <label htmlFor="projectSelect" className="form-label fw-semibold">
                Project
              </label>
              <select
                id="projectSelect"
                className="form-select"
                value={filter.project}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, project: val }));
                  setSelectedProjectId(val);
                  setCurrentPage(1);
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
          </div>

          {/* Row 2: Type | Start Date | End Date */}
          <div className="row gx-3 gy-3 align-items-end mt-2">
            <div className="col-md-2">
              <label htmlFor="typeSelect" className="form-label fw-semibold">
                Type
              </label>
              <select
                id="typeSelect"
                className="form-control"
                value={filter.result_type}
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
                    {rt.label}
                  </option>
                ))} */}
              </select>
            </div>
            <div className="col-md-5">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={filter.dateRange[0] || startDate || ""}
                onChange={(e) => {
                  const newRange = [...filter.dateRange];
                  newRange[0] = e.target.value;
                  setFilter((prev) => ({ ...prev, dateRange: newRange }));
                }}
              />
            </div>
            <div className="col-md-5">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control"
                value={filter.dateRange[1] || endDate || ""}
                onChange={(e) => {
                  const newRange = [...filter.dateRange];
                  newRange[1] = e.target.value;
                  setFilter((prev) => ({ ...prev, dateRange: newRange }));
                }}
              />
            </div>
            {/* Spacer to fill out 12 columns */}
            <div className="col-md-3"></div>
          </div>

          {/* Row 3: Search | Export Excel | Export PDF | Reset */}
          <div className="row gx-3 gy-3 align-items-end">
            <div className="col-md-6">
              <label htmlFor="searchInput" className="form-label fw-semibold">
                Search
              </label>
              <input
                id="searchInput"
                type="text"
                className="form-control"
                placeholder="Search by keyword"
                value={filter.keyword}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, keyword: e.target.value }))
                }
              />
            </div>

            <div className="col-md-2">
              <label
                className="form-label fw-semibold invisible"
                style={{ background: "#487FFF" }}
              >
                Export Excel
              </label>
              <button
                style={{ background: "#487FFF", color: "#fff" }}
                className="btn btn-light w-100"
                onClick={exportData}
              >
                {exportLoading ? "Exporting..." : "Export"}
              </button>
            </div>
            {/* <div className="col-md-2">
              <label className="form-label fw-semibold invisible">
                Export PDF
              </label>
              <button
                style={{ background: "#487FFF", color: "#fff" }}
                className="btn btn-light w-100"
                onClick={exportPdf}
              >
                Export PDF
              </button>
            </div> */}
            <div className="col-md-2">
              <label className="form-label fw-semibold invisible">Reset</label>
              <button className="btn btn-secondary w-100" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Now the Table itself ─── */}
      <div className="table-wrapper dragscroll mt-20">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Table
            className="custom-table"
            rowKey="_id"
            columns={columns}
            dataSource={formattedData?.data || []}
            pagination={{
              pageSize: limit,
              current: currentPage,
              total: totalPages * limit,
              showSizeChanger: false,
              onChange: (page) => setCurrentPage(page),
            }}
            expandable={{
              expandedRowKeys,
              onExpand: handleExpand,
              rowExpandable: (record) =>
                Array.isArray(record.children) && record.children.length > 0,
            }}
          />
        )}
      </div>

    </div>
  );
};

export default RankingReportIndex;
