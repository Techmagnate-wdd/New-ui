import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Table, Empty, Badge, Select, Input, Tooltip, Tabs } from "antd";
import { Spinner } from "react-bootstrap";
import { getExcel, getProjects, getUnifiedSerpDashboard, getUnifiedTestingDashboard } from "../../services/api";
import AuthContext from "../../context/AuthContext";

const { Option } = Select;
const { TabPane } = Tabs;
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

const TABS = [
  { key: "ranking", label: "Ranking" },
  { key: "summary", label: "Summary" },
  { key: "category_brand", label: "Brand" },
  { key: "category_subcategory", label: "Content Bucket" },
  { key: "category_only", label: "Product" },
];

const summaryMap = {
  averageSerpPercentage: "Average SERP Percentage",
  totalKeywords: "Total Keywords",
  // coreKeywords: "Core Keywords",
  // nonCoreKeywords: "Non Core Keywords",
  totalYCount: "Total Y Count",
  totalNCount: "Total N Count",
};

export default function UnifiedTesting() {
  const { user } = useContext(AuthContext);

  // Projects
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState("summary");

  // Common filters
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);

  // Tab-specific filters
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [brandType, setBrandType] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");

  // Filter options
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  const [allBrands, setAllBrands] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Data
  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // cache
  const [tabCache, setTabCache] = useState({});


  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Loading
  const [loading, setLoading] = useState(false);

  // Refs
  const debounceRef = useRef(null);
  const abortRef = useRef(null);



  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const resp = await getProjects();
      const fetched = resp.data?.projects || [];
      setProjects(fetched);

      if (fetched.length && !selectedProject) {
        const defaultProjectId = fetched[0]._id;
        setSelectedProject(defaultProjectId);
      }
    } catch (e) {
      console.error("fetchProjects", e);
    }
  }, [selectedProject]);

  // Fetch projects on mount
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // ✅ 1. Define cache key FIRST
  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      tab: activeTab,
      project: selectedProject,
      page,
      pageSize,
      selectedDate,
      category,
      subCategory,
      brand,
      brandType,
      keywordSearch,
    });
  }, [
    activeTab,
    selectedProject,
    page,
    pageSize,
    selectedDate,
    category,
    subCategory,
    brand,
    brandType,
    keywordSearch,
  ]);

  // Build filter object based on active tab
  const buildFilterObject = useCallback(() => {
    const baseFilter = {
      project: selectedProject,
      selectedDate: selectedDate || undefined,
    };

    switch (activeTab) {
      case "ranking":
        return {
          ...baseFilter,
          keyword: keywordSearch || undefined,
          brand: brand || undefined,
        };

      case "summary":
        return {
          ...baseFilter,
          category: category || undefined,
          brand: brand || undefined,
          subCategory: subCategory || undefined,
        };

      case "category_brand":
        return {
          ...baseFilter,
          category: category || undefined,
          brandType: brandType || undefined,
        };

      case "category_subcategory":
        return {
          ...baseFilter,
          category: category || undefined,
          subCategory: subCategory || undefined,
        };

      case "category_only":
        return {
          ...baseFilter,
          category: category || undefined,
        };

      default:
        return baseFilter;
    }
  }, [selectedProject, selectedDate, activeTab, keywordSearch, brand, category, subCategory, brandType]);

  // ✅ 2. THEN define fetchData
  const fetchData = useCallback(async () => {
    if (!selectedProject) return;

    const cacheKey = getCacheKey();

    if (tabCache[cacheKey]) {
      const cached = tabCache[cacheKey];
      setTableData(cached.data);
      setTotalCount(cached.count);
      setSummary(cached.summary);
      setAvailableDates(cached.availableDates || []);
      setCategoryList(cached.categoryList || []);
      setSubCategoryList(cached.subCategoryList || []);
      return;
    }

    if (abortRef.current) {
      try { abortRef.current.abort(); } catch { }
    }
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const filterObj = buildFilterObject();

      const resp = await getUnifiedTestingDashboard(
        {
          tab: activeTab,
          page,
          limit: pageSize,
          filter: filterObj,
        },
        { signal: abortRef.current.signal }
      );

      const payload = resp.data || {};

      const cachePayload = {
        data: payload.data || [],
        count: payload.count || 0,
        summary: payload.summary || null,
        availableDates: payload.uniqueDates || [],
        categoryList: payload.uniqueCategories || [],
        subCategoryList: payload.uniqueSubCategories || [],
      };

      setTabCache(prev => ({
        ...prev,
        [cacheKey]: cachePayload,
      }));

      setTableData(cachePayload.data);
      setTotalCount(cachePayload.count);
      setSummary(cachePayload.summary);
      setAvailableDates(cachePayload.availableDates);
      setCategoryList(cachePayload.categoryList);
      setSubCategoryList(cachePayload.subCategoryList);

    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("fetchData error", err);
      }
    } finally {
      setLoading(false);
    }
  }, [
    selectedProject,
    page,
    pageSize,
    activeTab,
    selectedDate,
    buildFilterObject,
    getCacheKey,
    tabCache,
  ]);

  // Debounced fetch on filter changes
  useEffect(() => {
    if (!selectedProject) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchData, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [selectedProject, page, pageSize, selectedDate, fetchData]);

  useEffect(() => {
    setTabCache({});
  }, [selectedProject]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, subCategory, brand, brandType, keywordSearch, selectedDate, activeTab]);

  // Reset filters when tab changes
  const handleTabChange = (key) => {
    setActiveTab(key);
    setCategory("");
    setSubCategory("");
    setBrand("");
    setBrandType("");
    setKeywordSearch("");
    setPage(1);
  };

  // Define columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case "ranking":
        return [
          {
            title: "Keyword",
            dataIndex: "keyword",
            key: "keyword",
            width: 150,
            render: v => v || "-",
          },
          {
            title: "Product",
            dataIndex: "category",
            key: "category",
            width: 120,
            render: v => v || "-",
          },
          {
            title: "Brand",
            dataIndex: "brand",
            key: "brand",
            width: 100,
            render: v => v || "-",
          },
          {
            title: "Content Bucket",
            dataIndex: "subCategory",
            key: "subCategory",
            width: 150,
            render: v => v || "-",
          },
          {
            title: "Featured Snippet",
            dataIndex: "featured_snippet",
            key: "featured_snippet",
            width: 120,
            render: v => <FSBadge val={v} />,
          },
          {
            title: "Top 10 Rank",
            dataIndex: "top_10_rank",
            key: "top_10_rank",
            width: 120,
            render: v => <FSBadge val={v} />,
          },
          {
            title: "PAA Status",
            dataIndex: "paa_status",
            key: "paa_status",
            width: 120,
            render: v => <FSBadge val={v} />,
          },
          {
            title: "AI Overview",
            dataIndex: "ai_overview_Status",
            key: "ai_overview_Status",
            width: 120,
            render: v => <FSBadge val={v} />,
          },
          {
            title: "Images",
            dataIndex: "imagesStatus",
            key: "imagesStatus",
            width: 100,
            render: v => <FSBadge val={v} />,
          },
          {
            title: "Local Pack",
            dataIndex: "local_pack_status",
            key: "local_pack_status",
            width: 120,
            render: v => <FSBadge val={v} />,
          },
          {
            title: "App Features",
            dataIndex: "app_features",
            key: "app_features",
            width: 120,
            render: v => <FSBadge val={v} />,
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

      case "summary":
        return [
          {
            title: "Product",
            dataIndex: "product",
            key: "product",
            width: 120,
            render: v => v || "-",
          },
          {
            title: "Brand",
            dataIndex: "brand",
            key: "brand",
            width: 100,
            render: v => v || "-",
          },
          {
            title: "Content Bucket",
            dataIndex: "contentBucket",
            key: "contentBucket",
            width: 150,
            render: v => v || "-",
          },
          {
            title: "Keyword",
            dataIndex: "keyword",
            key: "keyword",
            width: 150,
            render: v => v || "-",
          },
          {
            title: "SERP %",
            dataIndex: "serpPercentage",
            key: "serpPercentage",
            width: 150,
            render: v => v || "-",
          },
        ];

      case "category_brand":
        return [
          {
            title: "Brand",
            dataIndex: "brandType",
            key: "brandType",
            width: 120,
            render: v => v || "-",
          },
          {
            title: "Product",
            dataIndex: "category",
            key: "category",
            width: 150,
            render: v => v || "-",
          },
          {
            title: "Keyword Count",
            dataIndex: "keywordCount",
            key: "keywordCount",
            width: 120,
            render: v => v || 0,
          },
          {
            title: "SERP %",
            dataIndex: "serpPercentage",
            key: "serpPercentage",
            width: 180,
            render: v => v || "-",
          },
        ];

      case "category_subcategory":
        return [
          {
            title: "Product",
            dataIndex: "category",
            key: "category",
            width: 150,
            render: v => v || "-",
          },
          {
            title: "Content Bucket",
            dataIndex: "subCategory",
            key: "subCategory",
            width: 150,
            render: v => v || "-",
          },
          {
            title: "Keyword Count",
            dataIndex: "keywordCount",
            key: "keywordCount",
            width: 120,
            render: v => v || 0,
          },
          {
            title: "SERP %",
            dataIndex: "serpPercentage",
            key: "serpPercentage",
            width: 180,
            render: v => v || "-",
          },
        ];

      case "category_only":
        return [
          {
            title: "Product",
            dataIndex: "category",
            key: "category",
            width: 200,
            render: v => v || "-",
          },
          {
            title: "Keyword Count",
            dataIndex: "keywordCount",
            key: "keywordCount",
            width: 150,
            render: v => v || 0,
          },
          {
            title: "SERP %",
            dataIndex: "serpPercentage",
            key: "serpPercentage",
            width: 200,
            render: v => v || "-",
          },
        ];

      default:
        return [];
    }
  };

  // Render tab-specific filters
  const renderTabFilters = () => {
    switch (activeTab) {
      case "ranking":
        return (
          <>
            <div className="col-md-3">
              <label htmlFor="brandFilter" className="form-label fw-semibold">
                Brand
              </label>
              {/* <select
                id="brandFilter"
                className="form-control"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">All</option>
                <option value="Branded">Brand</option>
                <option value="UnBranded">UnBrand</option>
              </select> */}

              <select
                className="form-control"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setCategory("");
                  setSubCategory("");
                }}
              >
                <option value="">All</option>
                {allBrands.map((b, i) => (
                  <option key={i} value={b}>{b}</option>
                ))}
              </select>

            </div>

            <div className="col-md-3">
              <label htmlFor="categoryFilter" className="form-label fw-semibold">
                Product
              </label>
              {/* <select
                id="categoryFilter"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select> */}

              <select
                className="form-control"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory("");
                }}
              >
                <option value="">All</option>
                {categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>

            </div>

            <div className="col-md-3">
              <label htmlFor="subCategoryFilter" className="form-label fw-semibold">
                Content Bucket
              </label>
              {/* <select
                id="subCategoryFilter"
                className="form-control"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">All</option>
                {subCategoryList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select> */}

              <select
                className="form-control"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">All</option>
                {subCategories.map((sc, i) => (
                  <option key={i} value={sc}>{sc}</option>
                ))}
              </select>

            </div>
          </>
        );

      case "summary":
        return (
          <>
            <div className="col-md-3">
              <label htmlFor="brandFilter" className="form-label fw-semibold">
                Brand
              </label>
              <select
                id="brandFilter"
                className="form-control"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">All</option>
                <option value="Branded">Brand</option>
                <option value="UnBranded">UnBrand</option>
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="categoryFilter" className="form-label fw-semibold">
                Product
              </label>
              <select
                id="categoryFilter"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="subCategoryFilter" className="form-label fw-semibold">
                Content Bucket
              </label>
              <select
                id="subCategoryFilter"
                className="form-control"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">All</option>
                {subCategoryList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </>
        );

      case "category_brand":
        return (
          <>
            <div className="col-md-3">
              <label htmlFor="brandTypeFilter" className="form-label fw-semibold">
                Brand
              </label>
              <select
                id="brandTypeFilter"
                className="form-control"
                value={brandType}
                onChange={(e) => setBrandType(e.target.value)}
              >
                <option value="">All</option>
                <option value="Branded">Branded</option>
                <option value="UnBranded">UnBranded</option>
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="categoryFilter" className="form-label fw-semibold">
                Product
              </label>
              <select
                id="categoryFilter"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </>
        );

      case "category_subcategory":
        return (
          <>
            <div className="col-md-3">
              <label htmlFor="categoryFilter" className="form-label fw-semibold">
                Product
              </label>
              <select
                id="categoryFilter"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="subCategoryFilter" className="form-label fw-semibold">
                Content Bucket
              </label>
              <select
                id="subCategoryFilter"
                className="form-control"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">All</option>
                {subCategoryList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </>
        );

      case "category_only":
        return (
          <>
            <div className="col-md-3">
              <label htmlFor="categoryFilter" className="form-label fw-semibold">
                Product
              </label>
              <select
                id="categoryFilter"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePrevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page >= totalPages) return;
    setPage(page + 1);
  };

  const handlePageClick = (pageNum) => {
    if (pageNum === page) return;
    setPage(pageNum);
  };

  const getPageNumbers = () => {
    const maxButtons = 7;
    const pages = [];

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  function buildKeywordMetaMap(excelRows = []) {
    const map = {};

    for (const r of excelRows) {
      const rawKw = r?.Keywords ?? r?.Keyword ?? r?.keywords ?? r?.keyword;
      if (!rawKw) continue;

      const kw = String(rawKw).trim().toLowerCase();
      if (!kw) continue;

      map[kw] = {
        Brand: r?.Brand ?? null,
        Category: r?.Category ?? null,
        SubCategory: r?.SubCategory ?? null,
        __raw: r
      };
    }

    return map;
  }

  function filterKeywordsByExcel(keywordMetaMap, filters = {}) {
    return Object.entries(keywordMetaMap)
      .filter(([_, meta]) => {
        if (!meta) return false;

        if (filters.brand && meta.Brand !== filters.brand) return false;
        if (filters.category && meta.Category !== filters.category) return false;
        if (filters.subCategory && meta.SubCategory !== filters.subCategory) return false;

        return true;
      })
      .map(([keyword]) => keyword);
  }

  const loadBaseExcelMetadata = useCallback(async () => {
    console.log(selectedProject, "selectedProject")
    if (!selectedProject) return;

    try {
      const res = await getExcel(selectedProject);
      const { brands, categories } = res.data.metadata || {};

      console.log(brands, "brands")

      setAllBrands(brands || []);
      setAllCategories(categories || []);
      setCategories(categories || []);
      setSubCategories([]);
    } catch (err) {
      console.error("Failed to load base Excel metadata", err);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadBaseExcelMetadata();
  }, [loadBaseExcelMetadata]);

  useEffect(() => {
    if (!selectedProject) return;
    console.log(brand, "brand")

    // Reset if brand cleared
    if (!brand) {
      setCategories(allCategories);
      setSubCategories([]);
      return;
    }

    (async () => {
      try {
        const res = await getExcel(selectedProject, { brand });
        console.log(res.data, "res")
        const { categories, subCategories } = res.data.metadata || {};

        console.log(subCategories, "subCategories")

        setCategories(categories || []);
        setSubCategories(subCategories || []);
      } catch (err) {
        console.error("Brand filter Excel error", err);
      }
    })();
  }, [brand, selectedProject, allCategories]);


  useEffect(() => {
    if (!selectedProject) return;

    (async () => {
      try {
        const res = await getExcel(selectedProject, {
          brand: brand || undefined,
          category: category || undefined,
        });

        const { subCategories } = res.data.metadata || {};
        setSubCategories(subCategories || []);
      } catch (err) {
        console.error("Category filter Excel error", err);
      }
    })();
  }, [brand, category, selectedProject]);

  console.log(allBrands, "all brands---------->")

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          SERP Unified Dashboard
        </h6>
      </div>

      {/* Filter Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* Project Filter - Always visible */}
            <div className="col-md-3">
              <label htmlFor="projectSelect" className="form-label fw-semibold">
                Project
              </label>
              <select
                id="projectSelect"
                className="form-control"
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
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

            {/* Date Filter – shared across tabs */}
            <div className="col-md-3">
              <label htmlFor="dateFilter" className="form-label fw-semibold">
                Date
              </label>
              <select
                id="dateFilter"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab-specific filters */}
            {renderTabFilters()}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h6 className="mb-3">Summary</h6>
            <div className="row">
              {Object.entries(summary)
                .filter(([key]) => summaryMap[key])
                .map(([key, value]) => (
                  <div key={key} className="col-md-3 mb-2">
                    <div
                      className="p-2"
                      style={{ border: "1px solid #ddd", borderRadius: 8 }}
                    >
                      <strong>{summaryMap[key]}</strong>: {value}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="">
        {loading ? (
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "6px",
              background: "#fff",
              borderRadius: "5px",
              marginBottom: "20px",
              marginTop: "20px",
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  width: "110px",
                  height: "32px",
                  borderRadius: "5px",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "6px",
              background: "#fff",
              borderRadius: "5px",
              marginBottom: "20px",
              marginTop: "20px",
              width: "fit-content",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1); // IMPORTANT: reset pagination on tab switch
                }}
                style={{
                  background: activeTab === tab.key ? "#487fff" : "transparent",
                  color: activeTab === tab.key ? "#fff" : "#374151",
                  fontFamily: "revert-layer",
                  padding: "6px 16px",
                  cursor: "pointer",
                  transition: "all 0.25s ease-in-out",
                  borderRadius: "5px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card shadow-sm p-3">
        {/* Table */}
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" />
          </div>
        ) : !tableData || tableData.length === 0 ? (
          <div className="p-4">
            <Empty description="No data found" />
          </div>
        ) : (
          <>
            <Table
              className="custom-table"
              columns={getColumns()}
              dataSource={tableData}
              pagination={false}
              rowKey={(record, index) => `${activeTab}-${index}-${record.keyword || record.category}`}
              scroll={{ x: "max-content" }}
            />

            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: "1px solid #dee2e6" }}>
                <div style={{ fontSize: "14px", color: "#6c757d" }}>
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} results
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="btn btn-sm btn-outline-secondary"
                    style={{
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    Previous
                  </button>

                  <div className="d-flex gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ minWidth: "40px" }}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="btn btn-sm btn-outline-secondary"
                    style={{
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      opacity: page === totalPages ? 0.5 : 1
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