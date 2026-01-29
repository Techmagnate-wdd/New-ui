import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Table, Empty, Badge, Select, Input, Tooltip } from "antd";
import { Spinner } from "react-bootstrap";
import { getExcel, getFeaturedSnippetDetails, getProjects, getSerpSummaryDashboard, getUnifiedRankingDashboard } from "../../services/api";
import * as XLSX from "xlsx";
import AuthContext from "../../context/AuthContext";

const { Option } = Select;
const DEFAULT_PAGE_SIZE = 25;
const DEBOUNCE_MS = 250;

function FSBadge({ val }) {
  if (val == null) return <Badge bg="secondary">-</Badge>;
  const v = String(val).toUpperCase();
  if (v === "Y") return <Badge bg="success">Y</Badge>;
  if (v === "N") return <Badge bg="danger">N</Badge>;
  if (v === "NO") return <Badge bg="secondary">NO</Badge>;
  return <Badge bg="secondary">{v}</Badge>;
}

export default function SerpSummaryDashboard() {
  // filters + selections
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");

  // excel source
  const [excelRows, setExcelRows] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  const [downloading, setDownloading] = useState(false);


  // server source
  const [serverRows, setServerRows] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);

  // fs status map (for compatibility)
  const [fsStatusMap, setFsStatusMap] = useState({});

  // table + pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalKeywords, setTotalKeywords] = useState(0);

  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [hoveredUrlKey, setHoveredUrlKey] = useState(null);
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState("")


  // refs
  const debounceRef = useRef(null);
  const excelAbortRef = useRef(null);
  const statusAbortRef = useRef(null);

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    selectedDate: "",
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


  // fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const resp = await getProjects();
      const fetched = resp.data?.projects || [];
      setProjects(fetched);
      console.log(fetched, "fetched")
      console.log(selectedProject, "selectedProject")
      if (fetched.length && !selectedProject) {
        console.log(fetched[0]._id, "fetched[0]._id")
        const defaultProjectId = fetched[0]._id;
        setSelectedProjectId(defaultProjectId);
        setFilter((prev) => ({ ...prev, project: defaultProjectId }));
      }
    } catch (e) {
      console.error("fetchProjects", e);
    }
  });

  console.log(filter, "filter")

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


  useEffect(() => {
    if (filter.project) {
      console.log(filter, "filter")
      fetchFeaturedStatusesForPage(filter.project);
    }
  }, [
    filter.project]
  );

  // fetch excel rows
  const fetchExcel = useCallback(async (projId) => {
    if (!projId) {
      setExcelRows([]);
      setBrandsList([]);
      setCategoryList([]);
      setSubCategoryList([]);
      setTotalKeywords(0);
      return;
    }

    if (excelAbortRef.current) try { excelAbortRef.current.abort(); } catch (e) { }
    excelAbortRef.current = new AbortController();

    setLoadingExcel(true);
    try {
      const res = await getExcel(projId, {}, { signal: excelAbortRef.current.signal });
      const rows = res.data?.tasks || [];
      const normalized = rows.map(r => {
        return {
          contentBucket: r["Content Bucket"] ?? r["content bucket"] ?? r.ContentBucket ?? r.contentBucket ?? r.Content_Bucket ?? r.Content ?? null,
          product: r["Product"] ?? r.product ?? r.ProductName ?? null,
          keyword: r["Keyword"] ?? r["Keywords"] ?? r.keyword ?? r.keywords ?? null,
          websiteUrl: r["Website URL"] ?? r["WebsiteURL"] ?? r.website_url ?? r.websiteUrl ?? r.url ?? null,
          brand: r["Brand"] ?? r.brand ?? null,
          category: r["Category"] ?? r.category ?? null,
          subCategory: r["SubCategory"] ?? r.subcategory ?? r["Sub Category"] ?? null,
          raw: r
        };
      });

      setExcelRows(normalized);
      setBrandsList([...new Set(normalized.map(x => x.brand).filter(Boolean))]);
      setCategoryList([...new Set(normalized.map(x => x.category).filter(Boolean))]);
      setSubCategoryList([...new Set(normalized.map(x => x.subCategory).filter(Boolean))]);

      const uniqueKeywords = new Set(normalized.map(x => (x.keyword || "").toString().trim().toLowerCase()).filter(Boolean));
      setTotalKeywords(uniqueKeywords.size);
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("fetchExcel error", err);
      setExcelRows([]);
    } finally {
      setLoadingExcel(false);
    }
  }, []);

  // fetch featured snippet details from server (page-limited)
  const fetchFeaturedStatusesForPage = useCallback(async (selectedProjectId, pageNum, limit, appliedFilters = {}) => {
    if (!selectedProjectId) return;

    setLoadingStatus(true);
    try {
      const filterObj = {
        project: selectedProjectId,
        date: date,
        keyword: keywordSearch,
        ...(appliedFilters.brand ? { brand: appliedFilters.brand } : {}),
        ...(appliedFilters.keyword ? { keyword: appliedFilters.keyword } : {}),
      };

      const resp = await getSerpSummaryDashboard(
        { page: pageNum, limit, filter: filterObj },
      );

      const payload = resp.data || {};
      const rows = payload.data || [];
      console.log(rows, "rows")
      console.log(payload, "payload")
      setDate(payload.uniqueDates[0] || "");
      const total = payload.count != null ? Number(payload.count) : Number(payload.total || 0);

      setServerRows(rows);
      setServerTotal(total || 0);

      // build fs map (fallback)
      const newMap = {};
      (rows || []).forEach(r => {
        const kw = (r.keyword || "").toString().trim().toLowerCase();
        if (!kw) return;
        if (r.featured_snippet) {
          newMap[kw] = { status: r.featured_snippet, matchedUrl: r.matchedUrl ?? r.matched_url ?? null, matchedDomain: r.matchedDomain ?? r.matched_domain ?? null };
        } else if (Array.isArray(r.urls) && r.urls.length > 0) {
          newMap[kw] = { status: "N", matchedUrl: r.urls[0] || null, matchedDomain: null };
        } else {
          newMap[kw] = { status: "NO", matchedUrl: null, matchedDomain: null };
        }
      });
      setFsStatusMap(prev => ({ ...prev, ...newMap }));
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("fetchFeaturedStatusesForPage error", err);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // load excel when project changes
  useEffect(() => {
    if (!selectedProject) return;
    fetchExcel(selectedProject);
    setPage(1);
    setFsStatusMap({});
  }, [selectedProject, fetchExcel]);

  // call server rows when page/size/brand/project changes
  useEffect(() => {
    if (!selectedProject) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filterForServer = { brand: brand || undefined };
      fetchFeaturedStatusesForPage(selectedProject, page, pageSize, filterForServer);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedProject, page, pageSize, brand, fetchFeaturedStatusesForPage]);

  // determine source
  const usingExcel = Array.isArray(excelRows) && excelRows.length > 0;

  // filtered excel rows (client-side)
  const filteredExcelRows = useMemo(() => {
    if (!usingExcel) return [];
    return excelRows.filter(r => {
      if (!r.keyword) return false;
      if (brand && (String(r.brand || "").toLowerCase() !== String(brand || "").toLowerCase())) return false;
      if (category && (String(r.category || "").toLowerCase() !== String(category || "").toLowerCase())) return false;
      if (subCategory && (String(r.subCategory || "").toLowerCase() !== String(subCategory || "").toLowerCase())) return false;
      if (keywordSearch) {
        const k = (r.keyword || "").toString().toLowerCase();
        if (!k.includes(String(keywordSearch).toLowerCase())) return false;
      }
      return true;
    });
  }, [excelRows, brand, category, subCategory, keywordSearch, usingExcel]);

  // page rows
  const pagedRows = useMemo(() => {
    if (usingExcel) {
      const start = (page - 1) * pageSize;
      return filteredExcelRows.slice(start, start + pageSize);
    } else {
      return serverRows || [];
    }
  }, [usingExcel, filteredExcelRows, serverRows, page, pageSize]);

  // tableData that matches columns below
  const tableData = useMemo(() => {
    if (!usingExcel) {
      return (pagedRows || []).map((r, idx) => ({
        key: `${(page - 1) * pageSize + idx}-${(r.keyword || "").toString().slice(0, 20)}`,
        subCategory: r.subCategory ?? r.SubCategory ?? "",
        brand: r.brand ?? r.brand ?? "",
        category: r.category ?? r.Category ?? "",
        keyword: r.keyword ?? "",
        serpPercentage: r.serpPercentage ?? "",
      }));
    }

    return pagedRows.map((r, idx) => ({
      key: `${(page - 1) * pageSize + idx}-${(r.keyword || "").toString().slice(0, 20)}`,
      subCategory: r.contentBucket || r.subCategory || "",
      brand: r.brand ?? r.brand ?? "",
      category: r.product || r.category || "",
      keyword: r.keyword || "",
      serpPercentage: r.serpPercentage ?? "",
    }));

  }, [pagedRows, usingExcel, page, pageSize, fsStatusMap]);

  // columns must match keys in tableData
  const columns = [
    {
      title: "Product",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: v => v || "-",
      // fixed: "left"
    },
    {
      title: "Core/Non Core",
      dataIndex: "brand",
      key: "brand",
      width: 100,
      render: v => v || "-",
      // fixed: "left"
    },
    {
      title: "Content Bucket",
      dataIndex: "subCategory",
      key: "subCategory",
      width: 180,
      render: v => v || "-",
      // fixed: "left"
    },
    {
      title: "Keyword",
      dataIndex: "keyword",
      key: "keyword",
      width: 150,
      render: v => v || "-",
      // fixed: "left"
    },
    {
      title: "Google SERP (%)",
      dataIndex: "serpPercentage",
      key: "serpPercentage",
      width: 150,
      render: v => v || "-",
    },

  ];

  // pagination totals and display
  const displayTotal = usingExcel ? filteredExcelRows.length : serverTotal;

  // --- NEW: custom pagination helpers ---
  const totalRows = displayTotal;
  const currentPage = page;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    setPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage >= totalPages) return;
    setPage(currentPage + 1);
  };

  const handlePageClick = (pageNum) => {
    if (pageNum === currentPage) return;
    setPage(pageNum);
  };

  /**
   * Returns an array of page numbers to display.
   * Keeps the list compact for large totalPages by showing a sliding window.
   * e.g. for many pages: [1,2,3,4,5] or [current-2 ... current+2]
   */
  const getPageNumbers = () => {
    const maxButtons = 7; // total numeric buttons to show (adjustable)
    const pages = [];

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // sliding window centered on currentPage
    let half = Math.floor(maxButtons / 2); // e.g. 3 for 7
    let start = Math.max(1, currentPage - half);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  // --- END helpers ---

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Serp Unified Dashboard
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
                  setPage(1);
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

            {/* <div className="col-md-3">
              <label htmlFor="searchKeyword" className="form-label fw-semibold">
                Search Keyword
              </label>
              <Input
                className="form-control"
                value={keywordSearch} onChange={(e) => { setKeywordSearch(e.target.value); setPage(1); }} placeholder="filter by keyword" />
            </div> */}

            {/* DATE */}
            {/* <div className="col-md-4">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Date
              </label>

              <input
                id="date"
                type="date"
                className="form-control"
                value={filter.selectedDate || date || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    selectedDate: e.target.value || "",
                  }));
                }}
              />
            </div> */}
          </div>


        </div>

        {/* <div className="d-flex gap-3 mt-3" style={{ width: "fit-content" }}>
          <div className="p-2" style={{ border: "1px solid #ddd", borderRadius: 8 }}>
            <strong>Total Keywords</strong>: {usingExcel ? filteredExcelRows.length : serverTotal}
          </div>
        </div> */}
      </div>

      <div className="card shadow-sm p-3">
        {(loadingExcel || loadingStatus) ? (
          <div className="text-center p-4"><Spinner animation="border" /></div>
        ) : (!tableData || tableData.length === 0) ? (
          <div className="p-4"><Empty description="No rows found" /></div>
        ) : (
          <>
            <Table
              className="custom-table"
              columns={columns}
              dataSource={tableData}
              pagination={false}
              rowKey="key"
              scroll={{ x: "max-content" }}
            />

            {/* Pagination */}
            {!loadingExcel && !loadingStatus && totalPages > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: "1px solid #dee2e6" }}>
                <div style={{ fontSize: "14px", color: "#6c757d" }}>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} results
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-outline-secondary"
                    style={{
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                  >
                    Previous
                  </button>

                  <div className="d-flex gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ minWidth: "40px" }}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm btn-outline-secondary"
                    style={{
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
