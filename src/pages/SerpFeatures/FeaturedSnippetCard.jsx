// import React, {
//     useCallback,
//     useEffect,
//     useRef,
//     useState,
// } from "react";
// import { Table, Empty } from "antd";
// import dayjs from "dayjs";
// import { Spinner } from "react-bootstrap";
// import { getFeaturedSnippet } from "../../services/api";
// import FeatureDetailsModal from "./DetailsModal";
// import TooltipIcon from "../LLM/ToolTipIcon";

// const DEBOUNCE_MS = 350;
// const DEFAULT_DETAILS_LIMIT = 50;

// const tooltipText = {
//     Opportunity: "Keywords where your domain can win Featured Snippets.",
//     default: "The fp percentage of keywords for this competitor.",
// };

// const FeaturedSnippetCard = ({ filter, setTotalSV, setTotalKeywords }) => {
//     const [loading, setLoading] = useState(false);
//     const [tableColumns, setTableColumns] = useState([]);
//     const [tableData, setTableData] = useState([]);
//     const [rawApiResponse, setRawApiResponse] = useState(null);

//     const [detailsVisible, setDetailsVisible] = useState(false);
//     const [detailsRows, setDetailsRows] = useState([]);
//     const [detailsPage, setDetailsPage] = useState(1);
//     const [detailsLimit, setDetailsLimit] = useState(DEFAULT_DETAILS_LIMIT);
//     const [detailsTotal, setDetailsTotal] = useState(0);
//     const [detailsContext, setDetailsContext] = useState({ type: "", value: "" });
//     const [detailsLoading, setDetailsLoading] = useState(false);
//     const currentQueryRef = useRef(null);
//     const [currentQuery, setCurrentQuery] = useState(null);

//     // refs for debounce / abort / duplicate-guard
//     const debounceRef = useRef(null);
//     const mainAbortRef = useRef(null);
//     const detailsAbortRef = useRef(null);
//     const inflightRequestsRef = useRef(new Set());
//     const lastFilterRef = useRef(null);

//     // ---- helpers ----
//     const buildQueryFromFilter = useCallback((f) => {
//         const selectedDate = f.selectedDate
//             ? dayjs(f.selectedDate).format("YYYY-MM-DD")
//             : "";

//         return {
//             ...(f.keyword && { keyword: f.keyword }),
//             ...(selectedDate && { selectedDate }),
//             ...(f.project && { project: f.project }),
//             ...(f.result_type && { result_type: f.result_type }),
//             ...(f.category && { category: f.category }),
//             ...(f.subCategory && { subCategory: f.subCategory }),
//             ...(f.brand && { brand: f.brand }),
//         };
//     }, []);

//     // fetch summary table (no detailType/value)
//     const fetchSerpFeatures = useCallback(
//         (currentFilter) => {
//             if (debounceRef.current) clearTimeout(debounceRef.current);

//             debounceRef.current = setTimeout(async () => {
//                 const query = buildQueryFromFilter(currentFilter);
//                 currentQueryRef.current = query;
//                 setCurrentQuery(query);

//                 const key = JSON.stringify(query);
//                 if (inflightRequestsRef.current.has(key)) return;
//                 inflightRequestsRef.current.add(key);

//                 if (mainAbortRef.current) {

//                     try {
//                         mainAbortRef.current.abort();
//                     } catch (e) { }
//                 }
//                 const controller = new AbortController();
//                 mainAbortRef.current = controller;

//                 setLoading(true);
//                 setTableColumns([]);
//                 setTableData([]);
//                 setRawApiResponse(null);

//                 try {
//                     const resp = await getFeaturedSnippet(query, {
//                         signal: controller.signal,
//                     });
//                     const payload = resp.data || {};
//                     setRawApiResponse(payload);

//                     // set total sv in parent if provided
//                     try {
//                         if (payload.totals && payload.totals.excel && typeof setTotalSV === "function") {
//                             setTotalSV(payload.totals.excel.excelTotalSV);
//                             setTotalKeywords(payload.totals.excel.excelKeywordCount);
//                         }
//                     } catch (e) { }

//                     const colsFromApi = payload.columns || ["Total"];
//                     const rowsFromApi = payload.rows || [];

//                     const antdCols = [
//                         {
//                             title: "Metrics",
//                             dataIndex: "metric",
//                             key: "metric",
//                             fixed: "left",
//                             width: 220,
//                         },

//                         ...colsFromApi.map((colName) => {
//                             const tip =
//                                 tooltipText[colName] || tooltipText.default;

//                             return {
//                                 title: (
//                                     <div
//                                         style={{
//                                             display: "flex",
//                                             justifyContent: "center",
//                                             alignItems: "center",
//                                             gap: "6px",
//                                             whiteSpace: "nowrap",
//                                         }}
//                                     >
//                                         <span>{colName}</span>
//                                         {/* Uncomment if you want the tooltip */}
//                                         {/* <TooltipIcon title={tip} /> */}
//                                     </div>
//                                 ),
//                                 dataIndex: colName,
//                                 key: colName,
//                                 align: "center",
//                                 width: 150,
//                                 render: (val, record) => {
//                                     // Make "Keyword Count" row clickable and trigger server-side modal load
//                                     const formatted = typeof val === "number" ? val.toLocaleString() : val;
//                                     if (String(record.metric).toLowerCase() === "keyword count") {
//                                         if (val == null || Number(val) === 0) {
//                                             return <div style={{ cursor: "default" }}>{formatted || "0"}</div>;
//                                         }

//                                         const isOpportunity = colName === "Opportunity";
//                                         // Backend supports detailType=brand (display brand) or competitorDomain.
//                                         // For featured snippet we will send brand for brand columns (including ourBrand).
//                                         const ctxType = isOpportunity ? "all" : "brand";
//                                         const ctxValue = isOpportunity ? "all" : colName;

//                                         return (
//                                             <button
//                                                 className="btn btn-link p-0"
//                                                 onClick={() => openDetailsModal({ type: ctxType, value: ctxValue })}
//                                                 style={{ color: "#0b5ed7", textDecoration: "none" }}
//                                                 title={`View ${formatted} keywords for ${colName}`}
//                                             >
//                                                 {formatted}
//                                             </button>
//                                         );
//                                     }

//                                     return <div style={{ cursor: "default" }}>{formatted}</div>;
//                                 },
//                             };
//                         }),
//                     ];

//                     const antdRows = (rowsFromApi || []).map((rowArr, idx) => {
//                         const metricLabel = rowArr[0] || `metric-${idx}`;
//                         const rowObj = { key: `r-${idx}`, metric: metricLabel };
//                         colsFromApi.forEach((col, i) => {
//                             rowObj[col] = rowArr[i + 1];
//                         });
//                         return rowObj;
//                     });

//                     setTableColumns(antdCols);
//                     setTableData(antdRows);
//                 } catch (err) {
//                     if (err?.name === "AbortError") return;
//                     console.error("fetchSerpFeatures error:", err);
//                 } finally {
//                     inflightRequestsRef.current.delete(key);
//                     setLoading(false);
//                 }
//             }, DEBOUNCE_MS);
//         },
//         [buildQueryFromFilter, setTotalSV]
//     );

//     // ---- details pagination helper (server-side) ----
//     const loadDetailsPage = useCallback(
//         async (pageNum, pageSize, ctxOverride) => {
//             // require project in current filter
//             const baseQuery = buildQueryFromFilter(filter || {});
//             if (!baseQuery.project) return;

//             const ctx = ctxOverride || detailsContext;

//             // abort previous details request if any
//             if (detailsAbortRef.current) {
//                 try {
//                     detailsAbortRef.current.abort();
//                 } catch (e) { }
//             }
//             const controller = new AbortController();
//             detailsAbortRef.current = controller;

//             setDetailsLoading(true);

//             try {
//                 const query = {
//                     ...baseQuery,
//                     pageNum,
//                     perPage: pageSize,
//                     ...(ctx && ctx.type ? { detailType: ctx.type, detailValue: ctx.value } : {}),
//                 };

//                 const resp = await getFeaturedSnippet(query, {
//                     signal: controller.signal,
//                 });
//                 const payload = resp.data || {};

//                 const list = Array.isArray(payload.pagedKeywords) ? payload.pagedKeywords : [];

//                 const rows = list.map((it) => ({
//                     keyword: it.keyword,
//                     domain: it.domain || null,
//                     url: it.url || null,
//                     sv: it.sv || 0,
//                     count: it.count || 0,
//                     brand: it.brand || null,
//                 }));

//                 setDetailsRows(rows);
//                 setDetailsTotal(payload.pagination?.totalKeywordsMatched || rows.length);
//             } catch (err) {
//                 if (err?.name === "AbortError") return;
//                 console.error("loadDetailsPage error:", err);
//             } finally {
//                 setDetailsLoading(false);
//             }
//         },
//         [buildQueryFromFilter, detailsContext, filter]
//     );

//     // ---- modal helpers ----
//     const openDetailsModal = useCallback(
//         ({ type, value }) => {
//             const ctx = { type, value };
//             setDetailsContext(ctx);
//             setDetailsPage(1);
//             setDetailsLimit(DEFAULT_DETAILS_LIMIT);
//             setDetailsVisible(true);

//             // load first page from server (server returns filtered distinct keywords)
//             loadDetailsPage(1, DEFAULT_DETAILS_LIMIT, ctx);
//         },
//         [loadDetailsPage]
//     );

//     const closeDetailsModal = useCallback(() => {
//         setDetailsVisible(false);
//         setDetailsRows([]);
//         setDetailsTotal(0);
//         if (detailsAbortRef.current) {
//             try {
//                 detailsAbortRef.current.abort();
//             } catch (e) { }
//         }
//     }, []);

//     const onDetailsPageChange = useCallback(
//         (pageNum, pageSize) => {
//             setDetailsPage(pageNum);
//             setDetailsLimit(pageSize);
//             loadDetailsPage(pageNum, pageSize);
//         },
//         [loadDetailsPage]
//     );


//     const handleDownloadAllDetails = useCallback(async () => {
//         const baseQuery = currentQueryRef.current;
//         if (!baseQuery?.project) return [];
//         if (!currentQuery || !currentQuery.project) return [];

//         try {
//             const query = {
//                 ...baseQuery,
//                 pageNum: 1,
//                 perPage: detailsTotal || 1000000, // large number or let backend use downloadAll flag
//                 downloadAll: true,
//                 ...(detailsContext && detailsContext.type ? { detailType: detailsContext.type, detailValue: detailsContext.value } : {}),
//             };

//             const resp = await getFeaturedSnippet(query);
//             const payload = resp.data || {};
//             const list = Array.isArray(payload.pagedKeywords) ? payload.pagedKeywords : [];

//             let rows = list.map((it) => ({
//                 keyword: it.keyword,
//                 url: it.url || null,
//                 // image_url: it.image_url,
//                 sv: it.sv || 0,
//             }));

//             // client-side safety filter (optional)
//             const ctx = detailsContext;
//             if (ctx.type === "competitorDomain" && ctx.value) {
//                 const normVal = String(ctx.value || "")
//                     .replace(/^www\./, "")
//                     .toLowerCase();
//                 rows = rows.filter(
//                     (r) =>
//                         r.domain &&
//                         String(r.domain).replace(/^www\./, "").toLowerCase() === normVal
//                 );
//             }

//             return rows;
//         } catch (err) {
//             console.error("handleDownloadAllDetails error:", err);
//             return [];
//         }
//     }, [currentQuery, detailsContext, detailsTotal]);


//     // ---- effects ----
//     useEffect(() => {
//         if (!filter?.project) return;

//         fetchSerpFeatures(filter);

//         return () => {
//             if (debounceRef.current) clearTimeout(debounceRef.current);
//             if (mainAbortRef.current) {
//                 try {
//                     mainAbortRef.current.abort();
//                 } catch (e) { }
//             }
//             if (detailsAbortRef.current) {
//                 try {
//                     detailsAbortRef.current.abort();
//                 } catch (e) { }
//             }
//         };
//     }, [filter, fetchSerpFeatures]);

//     // ---- UI ----
//     return (
//         <div className="mt-4">
//             {loading ? (
//                 <div className="text-center p-4">
//                     <Spinner animation="border" />
//                 </div>
//             ) : !tableColumns.length || !tableData.length ? (
//                 <div className="p-4">
//                     <Empty description="No data to display. Adjust filters and try again." />
//                 </div>
//             ) : (
//                 <div
//                     className="card shadow-sm p-3 table-wrapper dragscroll"
//                     style={{ position: "relative" }}
//                 >
//                     <div
//                         style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             marginBottom: 12,
//                         }}
//                     >
//                         <h6 style={{ color: "#4a4a4a", margin: 0 }}>Featured Snippet</h6>

//                         <button
//                             className="btn btn-primary"
//                             onClick={() => openDetailsModal({ type: "all", value: "all" })}
//                         >
//                             View all
//                         </button>
//                     </div>

//                     <Table
//                         className="custom-table"
//                         rowKey="key"
//                         columns={tableColumns}
//                         dataSource={tableData}
//                         pagination={false}
//                         scroll={{ x: "max-content" }}
//                     />

//                     {detailsVisible && (
//                         <FeatureDetailsModal
//                             isOpen={detailsVisible}
//                             onClose={closeDetailsModal}
//                             loading={detailsLoading}
//                             rows={detailsRows}
//                             page={detailsPage}
//                             limit={detailsLimit}
//                             total={detailsTotal}
//                             onPageChange={onDetailsPageChange}
//                             onDownloadAll={handleDownloadAllDetails}
//                             title="Featured Snippet"
//                         />
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FeaturedSnippetCard;

// Filter optimized code

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { Table, Empty } from "antd";
import dayjs from "dayjs";
import { Spinner } from "react-bootstrap";
import { getFeaturedSnippet } from "../../services/api";
import FeatureDetailsModal from "./DetailsModal";
import TooltipIcon from "../LLM/ToolTipIcon";

const DEBOUNCE_MS = 350;
const DEFAULT_DETAILS_LIMIT = 50;

const tooltipText = {
    Opportunity: "Keywords where your domain can win Featured Snippets.",
    default: "The fp percentage of keywords for this competitor.",
};

const FeaturedSnippetCard = ({ filter, setTotalSV, setTotalKeywords, setSelectedProjectData }) => {
    const [loading, setLoading] = useState(false);
    const [tableColumns, setTableColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [rawApiResponse, setRawApiResponse] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [detailsRows, setDetailsRows] = useState([]);
    const [detailsPage, setDetailsPage] = useState(1);
    const [detailsLimit, setDetailsLimit] = useState(DEFAULT_DETAILS_LIMIT);
    const [detailsTotal, setDetailsTotal] = useState(0);
    const [detailsContext, setDetailsContext] = useState({ type: "" });
    const [detailsLoading, setDetailsLoading] = useState(false);
    const currentQueryRef = useRef(null);

    // refs for debounce / abort / duplicate-guard
    const debounceRef = useRef(null);
    const mainAbortRef = useRef(null);
    const detailsAbortRef = useRef(null);
    const inflightRequestsRef = useRef(new Set());
    const lastFilterRef = useRef(null);

    // ---- helpers ----
    const buildQueryFromFilter = useCallback((f) => {
        const selectedDate = f.selectedDate
            ? dayjs(f.selectedDate).format("YYYY-MM-DD")
            : "";

        return {
            ...(f.keyword && { keyword: f.keyword }),
            ...(selectedDate && { selectedDate }),
            ...(f.project && { project: f.project }),
            ...(f.result_type && { result_type: f.result_type }),
            ...(f.category && { category: f.category }),
            ...(f.subCategory && { subCategory: f.subCategory }),
            ...(f.brand && { brand: f.brand }),
        };
    }, []);

    // fetch summary table (no detailType/value)
    const fetchSerpFeatures = useCallback(
        async (currentFilter, signal) => {
            const query = buildQueryFromFilter(currentFilter);
            const key = JSON.stringify(query);

            // Skip if already in flight
            if (inflightRequestsRef.current.has(key)) {
                return;
            }

            // Skip if same as last filter
            if (lastFilterRef.current === key) {
                return;
            }

            inflightRequestsRef.current.add(key);
            lastFilterRef.current = key;
            currentQueryRef.current = query;

            setLoading(true);
            setTableColumns([]);
            setTableData([]);
            setRawApiResponse(null);

            try {
                const resp = await getFeaturedSnippet(query, { signal });
                const payload = resp.data || {};
                setRawApiResponse(payload);

                // set total sv in parent if provided
                if (payload.totals?.excel) {
                    if (typeof setTotalSV === "function") {
                        setTotalSV(payload.totals.excel.excelTotalSV || 0);
                    }
                    if (typeof setTotalKeywords === "function") {
                        setTotalKeywords(payload.totals.excel.excelKeywordCount || 0);
                    }
                }

                // Set project data if available
                console.log(payload.ourBrandName, "projectData")
                if (payload.projectData && typeof setSelectedProjectData === "function") {
                    setSelectedProjectData(payload.projectData);
                }

                const colsFromApi = payload.columns || ["Total"];
                const rowsFromApi = payload.rows || [];

                const antdCols = [
                    {
                        title: "Metrics",
                        dataIndex: "metric",
                        key: "metric",
                        fixed: "left",
                        width: 220,
                    },
                    ...colsFromApi.map((colName) => {
                        const tip = tooltipText[colName] || tooltipText.default;

                        return {
                            title: (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "6px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <span>{colName}</span>
                                </div>
                            ),
                            dataIndex: colName,
                            key: colName,
                            align: "center",
                            width: 150,
                            render: (val, record) => {
                                const formatted = typeof val === "number" ? val.toLocaleString() : val;

                                if (String(record.metric).toLowerCase() === "keyword count") {
                                    if (val == null || Number(val) === 0) {
                                        return <div style={{ cursor: "default" }}>{formatted || "0"}</div>;
                                    }

                                    const isOpportunity = colName === "Opportunity";
                                    const ctxType = isOpportunity ? "all" : colName;

                                    return (
                                        <button
                                            className="btn btn-link p-0"
                                            // onClick={() => openDetailsModal({ type: ctxType, value: ctxValue })}
                                            onClick={() => openDetailsModal({ type: ctxType })}
                                            style={{ color: "#0b5ed7", textDecoration: "none" }}
                                            title={`View ${formatted} keywords for ${colName}`}
                                        >
                                            {formatted}
                                        </button>
                                    );
                                }

                                return <div style={{ cursor: "default" }}>{formatted}</div>;
                            },
                        };
                    }),
                ];

                const antdRows = (rowsFromApi || []).map((rowArr, idx) => {
                    const metricLabel = rowArr[0] || `metric-${idx}`;
                    const rowObj = { key: `r-${idx}`, metric: metricLabel };
                    colsFromApi.forEach((col, i) => {
                        rowObj[col] = rowArr[i + 1];
                    });
                    return rowObj;
                });

                setTableColumns(antdCols);
                setTableData(antdRows);
            } catch (err) {
                if (err?.name === "AbortError") return;
                console.error("fetchSerpFeatures error:", err);
            } finally {
                inflightRequestsRef.current.delete(key);
                setLoading(false);
            }
        },
        [buildQueryFromFilter, setTotalSV, setTotalKeywords, setSelectedProjectData]
    );

    // ---- details pagination helper (server-side) ----
    const loadDetailsPage = useCallback(
        async (pageNum, pageSize, ctxOverride) => {
            const baseQuery = buildQueryFromFilter(filter || {});
            if (!baseQuery.project) return;

            const ctx = ctxOverride || detailsContext;

            // abort previous details request if any
            if (detailsAbortRef.current) {
                try {
                    detailsAbortRef.current.abort();
                } catch (e) { }
            }
            const controller = new AbortController();
            detailsAbortRef.current = controller;

            setDetailsLoading(true);

            try {
                // const query = {
                //     ...baseQuery,
                //     pageNum,
                //     perPage: pageSize,
                //     ...(ctx && ctx.type ? { detailType: ctx.type, detailValue: ctx.value } : {}),
                // };

                const query = {
                    ...baseQuery,
                    pageNum,
                    perPage: pageSize,
                    ...(ctx && ctx.type ? { detailType: ctx.type } : {}),
                };

                const resp = await getFeaturedSnippet(query, {
                    signal: controller.signal,
                });
                const payload = resp.data || {};

                const list = Array.isArray(payload.pagedKeywords) ? payload.pagedKeywords : [];

                const rows = list.map((it) => ({
                    keyword: it.keyword,
                    domain: it.domain || null,
                    url: it.url || null,
                    sv: it.sv || 0,
                    count: it.count || 0,
                    brand: it.brand || null,
                }));

                setDetailsRows(rows);
                setDetailsTotal(payload.pagination?.totalKeywordsMatched || rows.length);
            } catch (err) {
                if (err?.name === "AbortError") return;
                console.error("loadDetailsPage error:", err);
            } finally {
                setDetailsLoading(false);
            }
        },
        [buildQueryFromFilter, detailsContext, filter]
    );

    // ---- modal helpers ----
    // const openDetailsModal = useCallback(
    //     ({ type, value }) => {
    //         const ctx = { type, value };
    //         setDetailsContext(ctx);
    //         setDetailsPage(1);
    //         setDetailsLimit(DEFAULT_DETAILS_LIMIT);
    //         setDetailsVisible(true);

    //         loadDetailsPage(1, DEFAULT_DETAILS_LIMIT, ctx);
    //     },
    //     [loadDetailsPage]
    // );

    const openDetailsModal = useCallback(
        ({ type }) => {
            const ctx = { type };
            setDetailsContext(ctx);
            setDetailsPage(1);
            setDetailsLimit(DEFAULT_DETAILS_LIMIT);
            setDetailsVisible(true);
            loadDetailsPage(1, DEFAULT_DETAILS_LIMIT, ctx);
        },
        [loadDetailsPage]
    );

    const closeDetailsModal = useCallback(() => {
        setDetailsVisible(false);
        setDetailsRows([]);
        setDetailsTotal(0);
        if (detailsAbortRef.current) {
            try {
                detailsAbortRef.current.abort();
            } catch (e) { }
        }
    }, []);

    const onDetailsPageChange = useCallback(
        (pageNum, pageSize) => {
            setDetailsPage(pageNum);
            setDetailsLimit(pageSize);
            loadDetailsPage(pageNum, pageSize);
        },
        [loadDetailsPage]
    );

    const handleDownloadAllDetails = useCallback(async () => {
        const baseQuery = currentQueryRef.current;
        if (!baseQuery?.project) return [];

        try {
            const query = {
                ...baseQuery,
                pageNum: 1,
                perPage: detailsTotal || 1000000,
                downloadAll: true,
                ...(detailsContext && detailsContext.type ? {
                    detailType: detailsContext.type,
                    detailValue: detailsContext.value
                } : {}),
            };

            const resp = await getFeaturedSnippet(query);
            const payload = resp.data || {};
            const list = Array.isArray(payload.pagedKeywords) ? payload.pagedKeywords : [];

            const rows = list.map((it) => ({
                keyword: it.keyword,
                url: it.url || null,
                sv: it.sv || 0,
            }));

            return rows;
        } catch (err) {
            console.error("handleDownloadAllDetails error:", err);
            return [];
        }
    }, [detailsContext, detailsTotal]);

    // ---- effects ----
    useEffect(() => {
        if (!filter?.project) return;

        // Clear debounce timer if exists
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new debounce timer
        debounceRef.current = setTimeout(() => {
            // Abort previous request
            if (mainAbortRef.current) {
                try {
                    mainAbortRef.current.abort();
                } catch (e) { }
            }

            // Create new abort controller
            const controller = new AbortController();
            mainAbortRef.current = controller;

            // Fetch data
            fetchSerpFeatures(filter, controller.signal);
        }, DEBOUNCE_MS);

        // Cleanup function
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (mainAbortRef.current) {
                try {
                    mainAbortRef.current.abort();
                } catch (e) { }
            }
        };
    }, [filter, fetchSerpFeatures]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (detailsAbortRef.current) {
                try {
                    detailsAbortRef.current.abort();
                } catch (e) { }
            }
        };
    }, []);

    // ---- UI ----
    return (
        <div className="mt-4">
            {loading ? (
                <div className="text-center p-4">
                    <Spinner animation="border" />
                </div>
            ) : !tableColumns.length || !tableData.length ? (
                <div className="p-4">
                    <Empty description="No data to display. Adjust filters and try again." />
                </div>
            ) : (
                <div
                    className="card shadow-sm p-3 table-wrapper dragscroll"
                    style={{ position: "relative" }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                        }}
                    >
                        <h6 style={{ color: "#4a4a4a", margin: 0 }}>Featured Snippet</h6>

                        <button
                            className="btn btn-primary"
                            onClick={() => openDetailsModal({ type: "all", value: "all" })}
                        >
                            View all
                        </button>
                    </div>

                    <Table
                        className="custom-table"
                        rowKey="key"
                        columns={tableColumns}
                        dataSource={tableData}
                        pagination={false}
                        scroll={{ x: "max-content" }}
                    />

                    {detailsVisible && (
                        <FeatureDetailsModal
                            isOpen={detailsVisible}
                            onClose={closeDetailsModal}
                            loading={detailsLoading}
                            rows={detailsRows}
                            page={detailsPage}
                            limit={detailsLimit}
                            total={detailsTotal}
                            onPageChange={onDetailsPageChange}
                            onDownloadAll={handleDownloadAllDetails}
                            title="Featured Snippet"
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default FeaturedSnippetCard;