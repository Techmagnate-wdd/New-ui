// IndustryRanking.jsx
import React, { useEffect, useState, useCallback } from "react";
import TooltipIcon from "./ToolTipIcon";

// Download icon component
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
);

const IndustryRanking = ({
    data,
    totalPrompt
}) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "visibility", direction: "desc" }); // <-- default to highest visibility

    useEffect(() => {
        if (!data || !Array.isArray(data)) return;

        setLoading(true);
        const timeout = setTimeout(() => {
            const dataWithVisibility = data.map((c) => ({
                ...c,
                visibility: totalPrompt
                    ? ((c.mentions / totalPrompt) * 100).toFixed(2) + "%"
                    : "0%",
            }));

            setRows(dataWithVisibility);
            setLoading(false);
        }, 200);

        return () => clearTimeout(timeout);
    }, [data, totalPrompt]);

    const getLogoUrl = (domain) => {
        let logoDomain = domain === "dbs.bank.in" ? "dbs.com" : domain
        // return `https://logo.clearbit.com/${logoDomain}`;
        return `https://www.google.com/s2/favicons?sz=256&domain=${logoDomain}`;

    };

    // Sorting function
    const sortedRows = [...rows].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Convert visibility percentage to number for comparison
        if (sortConfig.key === "visibility") {
            aValue = parseFloat(aValue); // removes '%' and converts to number
            bValue = parseFloat(bValue);
        } else {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });


    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };


    return (
        <div className="">
            <div className="card h-100">
                <div className="card-body">

                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between" style={{ paddingBottom: "10px" }}>
                        <div className="mb-0 d-flex align-items-center" style={{ color: "#000", fontWeight: 500, fontSize: "1.25rem" }}>
                            AI visibility leaderboard
                        </div>

                        {/* <button
                            style={{
                                backgroundColor: "#fff",
                                // color: seriesData.length === 0 ? "#9ca3af" : "#374151",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                // cursor: seriesData.length === 0 ? "not-allowed" : "pointer",
                                outline: "none",
                                transition: "all 0.2s",
                            }}>
                            <DownloadIcon />
                        </button> */}

                    </div>
                    {/* Table */}
                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                        <table className="table table-sm mb-0 ir-table bordered-table" style={{ borderRadius: 0, }}>
                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr className="text-nowrap">
                                    <th scope="col" style={{ borderRadius: 0 }}
                                        onClick={() => handleSort("brand")}
                                    >
                                        <span>Brand</span>
                                        <TooltipIcon title={"All brands that were mentioned by AI across prompt answers. This may consist of your brand, competitors and third party brands."} />
                                    </th>
                                    <th scope="col" style={{ borderRadius: 0 }}
                                        onClick={() => handleSort("visibility")}
                                    >
                                        {/* <span>Visibility</span> */}
                                        Visibility {sortConfig.key === "visibility" ? (sortConfig.direction === "asc" ?
                                            <span style={{ cursor: "pointer" }}>↑</span> : <span
                                                style={{ cursor: "pointer" }}
                                            >↓</span>) : ""}

                                        <TooltipIcon title={"The percentage of prompts where the brand was mentioned in AI-generated answers. Higher is better."} />
                                    </th> {/* New column */}
                                </tr>
                            </thead>

                            <tbody>
                                {loading
                                    ? // Shimmer rows
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="text-nowrap">
                                            {/* Brand column */}
                                            <td style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 200 }}>
                                                <div
                                                    className="shimmer"
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        flexShrink: 0,
                                                        border: "1px solid #ddd",
                                                    }}
                                                ></div>
                                                <div
                                                    className="shimmer"
                                                    style={{ width: "120px", height: 16, borderRadius: "4px" }}
                                                ></div>
                                            </td>

                                            {/* Visibility column */}
                                            <td>
                                                <div
                                                    className="shimmer"
                                                    style={{ width: "60px", height: 16, borderRadius: "4px" }}
                                                ></div>
                                            </td>
                                        </tr>
                                    ))
                                    : // Real data rows
                                    sortedRows.map((r, i) => (
                                        <tr key={`${r.brand}-${i}`} className="text-nowrap">
                                            <td style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 200 }}>
                                                <div
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        backgroundColor: "#f0f0f0",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        border: "1px solid #ddd",
                                                        flexShrink: 0,
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            r.domain === "axismaxlife.com"
                                                                ? "/axismaxlifeinsurance.svg"
                                                                : r.domain === "bajajgeneralifeinsurance.com"
                                                                    ? "/bajajgeneralifeinsurance1.svg" : r.domain === "axisbank.com" ? "axisbank.jpg"
                                                                        : getLogoUrl(r.domain)
                                                        }
                                                        width={100}
                                                        alt={r.domain}
                                                        // onClick={() => getLogoUrl(r.domain)}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: "50%",
                                                            objectFit: "contain",
                                                        }}
                                                        onClick={() => {
                                                            const url = r.domain.startsWith("http") ? r.domain : `https://${r.domain}`;
                                                            window.open(url, "_blank");
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/32";
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ fontWeight: 500, flexGrow: 1 }}>
                                                    {/* {r.brand.charAt(0).toUpperCase() + r.brand.slice(1).toLowerCase()} */}
                                                    {r.brand}
                                                </span>
                                            </td>
                                            <td>{r.visibility}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default IndustryRanking;
