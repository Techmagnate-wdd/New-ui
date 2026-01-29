// IndustryRanking.jsx
import React, { useEffect, useState, useCallback } from "react";
import TooltipIcon from "./ToolTipIcon";

const safeDecode = (v) => {
    try {
        return decodeURIComponent(v || "").replace(/\+/g, " ");
    } catch {
        return v;
    }
};

// Download icon component
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
);

const TopKeywords = ({
    data
}) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        if (!data || !Array.isArray(data)) return;

        const totalMentions = data.reduce((sum, c) => sum + (c.mentions || 0), 0);

        const dataWithVisibility = data.map((c) => ({
            ...c,
            visibility: totalMentions ? ((c.mentions / totalMentions) * 100).toFixed(2) + "%" : "0%"
        }));

        setRows(dataWithVisibility);
    }, [data]);

    const getLogoUrl = (domain) => {
        return (

            `https://logo.clearbit.com/${domain}`
        )
    };


    return (
        <div className="">
            <div className="card h-100">
                <div className="card-body p-24">

                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-16">
                        <div className="mb-0 d-flex align-items-center" style={{ color: "#1c2024", fontWeight: 600, fontSize: "1.3rem" }}>
                            Top prompts driving visibility for your brand
                        </div>
                        <div>
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
                    </div>

                    {/* Table */}
                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                        <table className="table table-sm mb-0 ir-table bordered-table">
                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr className="text-nowrap">
                                    <th scope="col">

                                        <span>
                                            Prompt
                                            < TooltipIcon title={"The prompt that AI models used to generate their answers. This is the prompt that was used to generate the answers."} />
                                        </span>
                                    </th>
                                    <th scope="col">
                                        <span>
                                            Visibility
                                            < TooltipIcon title={"The percentage of prompts where the brand was mentioned in AI-generated answers. Higher is better."} />
                                        </span>
                                    </th>
                                    <th scope="col">
                                        <span>
                                            Answers
                                            < TooltipIcon title={"Total number of AI answers that mentioned this brand in the specified prompt."} />
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((r, i) => (
                                    <tr key={`${r.url}-${i}`} className="text-nowrap">
                                        <td title={r.keyword} style={{cursor:"pointer"}}>
                                            {r.keyword
                                                ? r.keyword.length > 50
                                                    ? safeDecode(r.keyword.substring(0, 100)) + "..."
                                                    : safeDecode(r.keyword)
                                                : ""}
                                        </td>
                                        {/* <td>{safeDecode(r.keyword) || ""}</td> */}
                                        <td>{`${r.visibility}%`}</td>
                                        <td>{r.answers}</td>
                                    </tr>
                                ))}
                                {err && (
                                    <tr>
                                        <td colSpan={6} className="small text-danger py-2">
                                            {err} — showing fallback data.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TopKeywords;
