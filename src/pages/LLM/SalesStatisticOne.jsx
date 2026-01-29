// SalesStatisticOne.jsx
import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";

// Download icon component
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
);

const LLM_NAME_MAP = {
    chatgpt: "ChatGPT",
    aimode: "AI Mode",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude"
};

const SalesStatisticOne = ({ aggregatedVisibility = {}, interval = "yearly", onIntervalChange, title }) => {
    const [exportLoading, setExportLoading] = useState(false)
    const { categories, seriesData } = useMemo(() => {
        if (!aggregatedVisibility || Object.keys(aggregatedVisibility).length === 0) {
            return { categories: [], seriesData: [] };
        }

        const datesSet = new Set();
        Object.values(aggregatedVisibility).forEach(domainData =>
            Object.keys(domainData).forEach(date => datesSet.add(date))
        );
        const sortedDates = Array.from(datesSet).sort();

        const seriesData = Object.entries(aggregatedVisibility).map(([domain, valuesObj]) => ({
            name: LLM_NAME_MAP[domain.toLowerCase()] || domain,
            data: sortedDates.map(date => valuesObj[date] ?? 0)
        }));

        const categories = sortedDates;

        return { categories, seriesData };
    }, [aggregatedVisibility]);

    // Download function to export data as CSV
    const handleDownload = () => {
        if (!categories.length || !seriesData.length) return;
        setExportLoading(true)
        // Create CSV content
        let csvContent = "Date," + seriesData.map(s => s.name).join(",") + "\n";

        categories.forEach((date, idx) => {
            const row = [date, ...seriesData.map(s => s.data[idx])].join(",");
            csvContent += row + "\n";
        });

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `visibility-trends-${interval}-${dayjs().format('YYYY-MM-DD')}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportLoading(false)
    };

    const chartOptions = useMemo(() => ({
        chart: {
            type: "line",
            height: 400,
            zoom: { enabled: false },
            toolbar: { show: false },
        },
        stroke: { curve: "smooth", width: 3 },
        markers: { size: 6, hover: { size: 8 } },
        colors: ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#F43F5E"],
        xaxis: {
            categories,
            labels: { rotate: -45, style: { fontSize: "13px", colors: "#6B7280" } }
        },
        yaxis: {
            min: 0,
            max: 100,
            labels: { formatter: (val) => `${val}%`, style: { fontSize: "13px" } },
            title: { text: "Visibility %", style: { fontWeight: 600, fontSize: "14px" } },
        },
        tooltip: {
            shared: true,
            intersect: false,
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                // Get the date - use the categories array from closure
                const date = categories[dataPointIndex] || "N/A";

                let html = `<div style="
                    min-width:280px; 
                    padding:12px; 
                    font-family: Arial, sans-serif; 
                    background:#fff; 
                    border:1px solid #ccc; 
                    border-radius:8px;
                    line-height:1.6;
                ">`;

                // Date heading
                html += `<div style="font-weight:bold; font-size:14px; margin-bottom:6px;">${date}</div>`;

                // Separator
                html += `<div style="border-bottom:1px solid #ddd; margin-bottom:8px;"></div>`;

                // Loop through each series
                series.forEach((seriesValues, idx) => {
                    const value = seriesValues[dataPointIndex];
                    const seriesName = w.config.series[idx].name;
                    const color = w.config.colors[idx] || "#4F46E5";

                    html += `
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; margin-bottom:4px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="width:10px; height:10px; border-radius:50%; background:${color}; display:inline-block;"></span>
                                <span>${seriesName}</span>
                            </div>
                            <div style="margin-left:100px; font-weight:bold;">${value}%</div>
                        </div>
                    `;
                });

                html += `</div>`;
                return html;
            }
        },
        legend: { position: "bottom", horizontalAlign: "left" },
        grid: { borderColor: "#E5E7EB", strokeDashArray: 4 },
    }), [categories]);

    return (
        <div className="col-xxl-12 col-xl-12">
            <div className="card h-100">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
                        <h6 className="text-lg mb-0 fw-500">{title}</h6>

                        <div className="d-flex align-items-center gap-2">
                            {/* <select
                                value={interval}
                                onChange={(e) => onIntervalChange?.(e.target.value)}
                                style={{
                                    backgroundColor: "#007bff",
                                    color: "#fff",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #0056b3",
                                    minWidth: "120px",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="daily" style={{ color: "#000" }}>Daily</option>
                                <option value="monthly" style={{ color: "#000" }}>Monthly</option>
                                <option value="yearly" style={{ color: "#000" }}>Yearly</option>
                            </select> */}

                            {/* <button
                                onClick={handleDownload}
                                disabled={seriesData.length === 0}
                                style={{
                                    backgroundColor: seriesData.length === 0 ? "#e5e7eb" : "#fff",
                                    color: seriesData.length === 0 ? "#9ca3af" : "#374151",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: seriesData.length === 0 ? "not-allowed" : "pointer",
                                    outline: "none",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    if (seriesData.length > 0) {
                                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                                        e.currentTarget.style.borderColor = "#9ca3af";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (seriesData.length > 0) {
                                        e.currentTarget.style.backgroundColor = "#fff";
                                        e.currentTarget.style.borderColor = "#d1d5db";
                                    }
                                }}
                                title="Download CSV"
                            >
                                <DownloadIcon />
                            </button> */}
                        </div>
                    </div>

                    {seriesData.length === 0 ? (
                        <div style={{ padding: 36, textAlign: "center", color: "#6c757d" }}>
                            <div style={{ fontSize: 18, marginBottom: 6 }}>No visibility data</div>
                            <div style={{ fontSize: 13 }}>Try another project or interval</div>
                        </div>
                    ) : (
                        <>

                            <ReactApexChart options={chartOptions} series={seriesData} type="line" height={336} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesStatisticOne;