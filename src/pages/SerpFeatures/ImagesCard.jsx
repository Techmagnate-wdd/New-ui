import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { Table, Empty } from "antd";
import dayjs from "dayjs";
import { Spinner } from "react-bootstrap";
import { getAppFeatures, getImages, getPAA, getPeopleAlsoAsk, getPeopleAlsoAskMetrics, getPeopleAlsoAskMetricsSummary } from "../../services/api";
import FeatureDetailsModal from "./DetailsModal";
import TooltipIcon from "../LLM/ToolTipIcon";

const DEBOUNCE_MS = 350;
const DEFAULT_DETAILS_LIMIT = 50;

const tooltipText = {
    Opportunity: "Keywords where your domain can win App.",
    default: "The fp percentage of keywords for this competitor.",
};

const ImagesCard = ({ filter, setTotalSV, setTotalKeywords, setSelectedProjectData }) => {
    const [loading, setLoading] = useState(false);
    const [tableColumns, setTableColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [rawApiResponse, setRawApiResponse] = useState(null);

    const [detailsVisible, setDetailsVisible] = useState(false);
    const [detailsRows, setDetailsRows] = useState([]);
    const [detailsPage, setDetailsPage] = useState(1);
    const [detailsLimit, setDetailsLimit] = useState(DEFAULT_DETAILS_LIMIT);
    const [detailsTotal, setDetailsTotal] = useState(0);
    const [detailsContext, setDetailsContext] = useState({ type: "", value: "" });
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

    const fetchSerpFeatures = useCallback(
        async (currentFilter) => {
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
                const resp = await getImages(query);
                const payload = resp.data || {};
                setRawApiResponse(payload);
                // set total sv in parent if provided
                try {
                    if (payload.totals && payload.totals.excel && typeof setTotalSV === "function") {
                        setTotalSV(payload.totals.excel.excelTotalSV);
                        setTotalKeywords(payload.totals.excel.excelKeywordCount);
                    }
                } catch (e) { }

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
                        const tip =
                            tooltipText[colName] || tooltipText.default; // Special case for "Opportunity"

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
                                    {/* <TooltipIcon title={tip} /> */}
                                </div>
                            ),
                            dataIndex: colName,
                            key: colName,
                            align: "center",
                            width: 150,
                            // render now receives value and record so we can detect which metric row this is
                            render: (val, record) => {
                                const formatted = typeof val === "number" ? val.toLocaleString() : val;

                                if (String(record.metric).toLowerCase() === "keyword count") {

                                    if (val == null || Number(val) === 0) {
                                        return <div style={{ cursor: "default" }}>{formatted || "0"}</div>;
                                    }

                                    const isOpportunity = colName === "Opportunity";

                                    const ctxType = isOpportunity ? "all" : colName;   // BRAND name

                                    return (
                                        <button
                                            className="btn btn-link p-0"
                                            onClick={() => openDetailsModal({ type: ctxType })}
                                            style={{ color: "#0b5ed7", textDecoration: "none" }}
                                            title={`View ${formatted} keywords for ${colName}`}
                                        >
                                            {formatted}
                                        </button>
                                    );
                                }

                                return <div style={{ cursor: "default" }}>{formatted}</div>;
                            }

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
            // try to use currentQuery; if not present, rebuild from latest filter as fallback
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
                const query = {
                    ...baseQuery,
                    pageNum,
                    perPage: pageSize,
                    ...(ctx && ctx.type ? { detailType: ctx.type } : {}),
                };

                const resp = await getImages(query, {
                    signal: controller.signal,
                });
                const payload = resp.data || {};
                const list = payload.pagedKeywords || [];

                // set total sv in parent if provided
                try {
                    if (payload.totals && payload.totals.excel && typeof setTotalSV === "function") {
                        setTotalSV(payload.totals.excel.excelTotalSV);
                    }
                } catch (e) { }

                let rows = list.map((it) => ({
                    keyword: it.keyword,
                    url: it.url || null,
                    // image_url: it.image_url || null,
                    sv: it.sv || 0,
                }))

                setDetailsRows(rows);
                setDetailsTotal(payload.pagination?.totalKeywordsMatched || rows.length);
            } catch (err) {
                if (err?.name === "AbortError") return;
                console.error("loadDetailsPage error:", err);
            } finally {
                setDetailsLoading(false);
            }
        },
        // add `filter` and `buildQueryFromFilter` to deps because we use them
        [detailsContext, filter, buildQueryFromFilter]
    );


    const openDetailsModal = useCallback(
        ({ type }) => {
            const ctx = { type };
            setDetailsContext(ctx);
            setDetailsPage(1);
            setDetailsLimit(DEFAULT_DETAILS_LIMIT);
            setDetailsVisible(true);

            // load first page from server
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
                perPage: detailsTotal || 1000000, // large number or let backend use downloadAll flag
                downloadAll: true,
                ...(detailsContext && detailsContext.type ? { detailType: detailsContext.type } : {}),
            };

            const resp = await getImages(query);
            const payload = resp.data || {};
            const list = Array.isArray(payload.pagedKeywords) ? payload.pagedKeywords : [];


            let rows = list.map((it) => ({
                keyword: it.keyword,
                url: it.url || null,
                // image_url: it.image_url,
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

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (mainAbortRef.current) {
                try {
                    mainAbortRef.current.abort();
                } catch (e) { }
            }

            const controller = new AbortController();
            mainAbortRef.current = controller;

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
                        <h6 style={{ color: "#4a4a4a", margin: 0 }}>Images</h6>

                        <button
                            className="btn btn-primary"
                            onClick={() => openDetailsModal({ type: "all" })}
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
                            title="Images"
                            onPageChange={onDetailsPageChange}
                            onDownloadAll={handleDownloadAllDetails}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ImagesCard;
