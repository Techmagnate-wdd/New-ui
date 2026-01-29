import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, Empty, Badge, Select, Input, Tooltip } from "antd";
import { Spinner } from "react-bootstrap";
import { getExcel, getFeaturedSnippetDetails, getProjects, getUnifiedRankingDashboard } from "../../services/api";
import * as XLSX from "xlsx";


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

export default function UnifiedDashboard() {
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


  // refs
  const debounceRef = useRef(null);
  const excelAbortRef = useRef(null);
  const statusAbortRef = useRef(null);

  // fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const resp = await getProjects();
      const projs = resp.data?.projects || [];
      setProjects(projs);
      if (projs.length && !selectedProject) {
        setSelectedProject(projs[0]._id);
      }
    } catch (e) {
      console.error("fetchProjects", e);
    }
  }, [selectedProject]);

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
  const fetchFeaturedStatusesForPage = useCallback(async (projId, pageNum, limit, appliedFilters = {}) => {
    if (!projId) return;
    if (statusAbortRef.current) try { statusAbortRef.current.abort(); } catch (e) { }
    statusAbortRef.current = new AbortController();

    setLoadingStatus(true);
    try {
      const filterObj = {
        project: projId,
        keyword: keywordSearch,
        ...(appliedFilters.brand ? { brand: appliedFilters.brand } : {}),
        ...(appliedFilters.keyword ? { keyword: appliedFilters.keyword } : {}),
      };

      console.log(filterObj, "filterObj")

      const resp = await getUnifiedRankingDashboard(
        { page: pageNum, limit, filter: filterObj },
        { signal: statusAbortRef.current.signal }
      );

      const payload = resp.data || {};
      const rows = payload.data || [];
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

  // initial projects load
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

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
        category: r.category ?? r.Category ?? "",
        keyword: r.keyword ?? "",
        // websiteUrl: 'https://www.' + r.matchedDomain || "",
        websiteUrl: r.top_10_matched_url || "",
        featured_snippet: r.featured_snippet ?? (fsStatusMap[(r.keyword || "").toLowerCase()] || {}).status,
        top_10_rank: r.top_10_rank || "N",
        app_features: r.app_features || "N",
        paa_status: r.paa_status || "N",
        ai_overview_Status: r.ai_overview_Status || "N",
        imagesStatus: r.imagesStatus || "N",
        local_pack_status: r.local_pack_status || "N",
        top_stories: r.top_stories || "N",
        short_video_status: r.short_video_status || "N",
        discussion_status: r.discussion_status || "N",
        video_status: r.video_status || "N",
        shopping_status: r.shopping_status || "N",
      }));
    }

    return pagedRows.map((r, idx) => ({
      key: `${(page - 1) * pageSize + idx}-${(r.keyword || "").toString().slice(0, 20)}`,
      subCategory: r.contentBucket || r.subCategory || "",
      category: r.product || r.category || "",
      keyword: r.keyword || "",
      websiteUrl: r.websiteUrl || r.raw?.["Website URL"] || "",
      featured_snippet: (fsStatusMap[(r.keyword || "").toLowerCase()] || {}).status ?? undefined,
      top_10_rank: r.top_10_rank || "N",
      app_features: r.app_features || "N",
      paa_status: r.paa_status || "N",
      ai_overview_Status: r.ai_overview_Status || "N",
      imagesStatus: r.imagesStatus || "N",
      local_pack_status: r.local_pack_status || "N",
      top_stories: r.top_stories || "N",
      short_video_status: r.short_video_status || "N",
      discussion_status: r.discussion_status || "N",
      video_status: r.video_status || "N",
      shopping_status: r.shopping_status || "N",
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
      title: "Ranking URL",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      width: 260,
      render: (v, record) => {
        if (!v) return "-";
        const max = 40;
        const short = v.length > max ? v.slice(0, max - 3) + "..." : v;

        // wrapper must be position: relative so tooltip can be absolute
        return (
          <div style={{
            position: "relative",
            display: "inline-block", maxWidth: 260
          }}>
            <a
              href={v}
              target="_blank"
              rel="noreferrer"
              title={v} // native tooltip fallback (string only)
              onMouseEnter={() => setHoveredUrlKey(v)}
              onMouseLeave={() => setHoveredUrlKey(null)}
              style={{
                display: "inline-block",
                maxWidth: 260,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "#0d6efd",
              }}
            >
              {short}
            </a>
          </div>
        );
      }
    },
    {
      title: "Featured Snippet",
      dataIndex: "featured_snippet",
      key: "featured_snippet",
      width: 120,
      align: "center",
      render: (v, record) => {
        // prefer server-provided v, else lookup fsStatusMap
        const val = v ?? (fsStatusMap[(record.keyword || "").toLowerCase()] || {}).status;
        return <FSBadge val={val} />;
      }
    },
    {
      title: "Top 10 Rank",
      dataIndex: "top_10_rank",
      key: "top_10_rank",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "App Pack",
      dataIndex: "app_features",
      key: "app_features",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "People Also Ask",
      dataIndex: "paa_status",
      key: "paa_status",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "AI Overview",
      dataIndex: "ai_overview_Status",
      key: "ai_overview_Status",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "Images",
      dataIndex: "imagesStatus",
      key: "imagesStatus",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "Local Pack",
      dataIndex: "local_pack_status",
      key: "local_pack_status",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "Top Stories",
      dataIndex: "top_stories",
      key: "top_stories",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "Short Videos",
      dataIndex: "short_video_status",
      key: "short_video_status",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "Discussions And Forums",
      dataIndex: "discussion_status",
      key: "discussion_status",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "Video",
      dataIndex: "video_status",
      key: "video_status",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    },
    {
      title: "Shopping",
      dataIndex: "shopping_status",
      key: "shopping_status",
      width: 120,
      align: "center",
      render: (v) => {
        return <FSBadge val={v || "N"} />;
      }
    }
  ];

  // pagination totals and display
  const displayTotal = usingExcel ? filteredExcelRows.length : serverTotal;
  const showingFrom = displayTotal === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, displayTotal);

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


  const handleDownloadAll = async () => {
    try {
      setDownloading(true);

      let rowsToExport = [];

      if (usingExcel) {
        // Use ALL filtered Excel rows (ignores pagination)
        rowsToExport = filteredExcelRows.map((r) => {
          const kw = (r.keyword || "").toString();
          const fs = (fsStatusMap[kw.toLowerCase()] || {}).status;

          return {
            Product: r.product || r.category || "",
            "Content Bucket": r.contentBucket || r.subCategory || "",
            Keyword: kw,
            "Website URL": r.websiteUrl || r.raw?.["Website URL"] || "",
            "Featured Snippet": fs || "",
            "Top 10 Rank": r.top_10_rank || "N",
            "App Features": r.app_features || "N",
            "App Features": r.app_features || "N",
            "People Also Ask": r.paa_status || "N",
            "AI Overview": r.ai_overview_Status || "N",
            "imagesStatus": r.imagesStatus || "N"
          };
        });
      } else {
        // 🔹 SERVER SOURCE: fetch *all* pages
        const filterObj = {
          project: selectedProject,
          ...(brand ? { brand } : {}),
          ...(keywordSearch ? { keyword: keywordSearch } : {}),
        };

        const PAGE_SIZE = 100; // frontend page size for download (backend will cap at MAX_LIMIT=1081)
        let page = 1;
        let allRows = [];
        let totalExpected = null;
        let hasMore = true;

        while (hasMore) {
          const resp = await getUnifiedRankingDashboard({
            page,
            limit: PAGE_SIZE,
            filter: filterObj,
          });

          const payload = resp.data || {};
          const pageRows = payload.data || [];
          const total =
            payload.count != null
              ? Number(payload.count)
              : Number(payload.total || 0);

          if (totalExpected == null) totalExpected = total;

          allRows = allRows.concat(pageRows);

          // stop when:
          // - this page had 0 rows OR
          // - we already have all rows (>= totalExpected)
          if (!pageRows.length || allRows.length >= totalExpected) {
            hasMore = false;
          } else {
            page += 1;
          }
        }

        rowsToExport = allRows.map((r) => {
          const kw = (r.keyword || "").toString();
          const fs =
            r.featured_snippet ??
            (fsStatusMap[kw.toLowerCase()] || {}).status ??
            "";

          return {
            Product: r.category ?? r.Category ?? "",
            "Content Bucket": r.subCategory ?? r.SubCategory ?? "",
            Keyword: kw,
            // "Ranking URL": r.matchedDomain
            //   ? `https://www.${r.matchedDomain}`
            //   : "",
            "Ranking URL": r.matchedUrl,
            "Featured Snippet": fs,
            "Top 10 Rank": r.top_10_rank || "N",
            "App Features": r.app_features || "N",
            "People Also Ask": r.paa_status || "N",
            "AI Overview": r.ai_overview_Status || "N",
            "Images": r.imagesStatus || "N",
          };
        });
      }

      if (!rowsToExport.length) {
        setDownloading(false);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(rowsToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "UnifiedDashboard");

      XLSX.writeFile(wb, "unified_ranking_dashboard.xlsx");
    } catch (e) {
      console.error("handleDownloadAll error", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="project-dashboard container1 py-4">
      <h5>Unified Ranking Dashboard</h5>

      {/* <div className="card shadow-sm p-3 mb-3"> */}
      {/* <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Project</label>
            <Select value={selectedProject} style={{ width: "100%" }} onChange={setSelectedProject} placeholder="Select project">
              {projects.map(p => <Option key={p._id} value={p._id}>{p.project_name}</Option>)}
            </Select>
          </div>

           <div className="col-md-2">
            <label className="form-label">Brand</label>
            <Select allowClear value={brand} onChange={(v) => { setBrand(v); setPage(1); }} placeholder="Brand" style={{ width: "100%" }}>
              {brandsList.map((b, i) => <Option key={i} value={b}>{b}</Option>)}
            </Select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Category</label>
            <Select allowClear value={category} onChange={(v) => { setCategory(v); setPage(1); }} placeholder="Category" style={{ width: "100%" }}>
              {categoryList.map((c, i) => <Option key={i} value={c}>{c}</Option>)}
            </Select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Sub Category</label>
            <Select allowClear value={subCategory} onChange={(v) => { setSubCategory(v); setPage(1); }} placeholder="SubCategory" style={{ width: "100%" }}>
              {subCategoryList.map((s, i) => <Option key={i} value={s}>{s}</Option>)}
            </Select>
          </div> 

          
        </div> */}

      {/* <div className="d-flex gap-3 mt-3" style={{ width: "fit-content" }}>
          <div className="p-2" style={{ border: "1px solid #ddd", borderRadius: 8 }}>
            <strong>Total Keywords</strong>: {usingExcel ? filteredExcelRows.length : serverTotal}
          </div>
        </div> */}
      {/* </div> */}
      <div className="col-md-3">
        <label className="form-label">Search Keyword</label>
        <Input value={keywordSearch} onChange={(e) => { setKeywordSearch(e.target.value); setPage(1); }} placeholder="filter by keyword" />
      </div>

      {/* <div className="card shadow-sm p-3"> */}
      {/* Download button */}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handleDownloadAll}
          disabled={downloading || !displayTotal}
        >
          {downloading ? "Downloading..." : "Download Excel"}
        </button>
      </div>
      {/* </div> */}

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
