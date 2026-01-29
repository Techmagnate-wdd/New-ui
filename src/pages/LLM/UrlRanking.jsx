// IndustryRanking.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import TooltipIcon from "./ToolTipIcon";

// Download icon component
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
);

const UrlRanking = ({
    data,
    selectedProjectDomain,
    selectedProject,
    selectedDate
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
        // return (

        // `https://logo.clearbit.com/${domain}`

        // )
        return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    };


    return (
        <div className="">
            <div className="card h-100">
                <div className="card-body p-24">

                    {/* Header */}
                    <div className=" d-flex align-items-center justify-content-between mb-16">
                        <div className="mb-0" style={{ color: "#000", fontWeight: 500, fontSize: "1.5rem" }}>
                            Your top cited pages

                            <p style={{ fontSize: "12px", color: "#8b8e98" }}>See which of your website pages are most cited in AI answers</p>
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
                                    <th scope="col" className="d-flex gap-2">
                                        <span ><img style={{ borderRadius: "100px" }} width="25px" height="20px" src={getLogoUrl(selectedProjectDomain)}></img></span>
                                        <span>Your Page URL</span>
                                    </th>
                                    <th scope="col">
                                        <span>
                                            Answers
                                            < TooltipIcon title={"Total number of AI answers that cited this domain or page as a source. Higher numbers indicate stronger AI visibility for this domain."} />
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((r, i) => (
                                    <tr key={`${r.url}-${i}`} className="text-nowrap">
                                        <td title={r.url} style={{ cursor: "pointer" }}>
                                            {r.url ? (r.url.length > 100 ? r.url.substring(0, 100) + "..." : r.url) : ""}
                                        </td>                                        <td>{r.keywords.length}</td>
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

                    {/* Footer */}
                    {/* <div
                        style={{
                            padding: "18px 24px",
                            borderTop: "1px solid #f3f4f6",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 16px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: "#ffffff",
                                fontSize: "14px",
                                color: "#374151",
                                cursor: "pointer",
                                fontWeight: "500",
                            }}
                        >
                            <Link className="d-block me-3"
                                to={`/llm-dashboard/${selectedProject}/${selectedProjectDomain}?date=${selectedDate}`}
                            >View full report
                            </Link>

                            <span style={{ fontSize: "12px" }}>→</span>
                        </button>
                    </div> */}

                    <div
                        style={{
                            padding: "18px 24px",
                            borderTop: "1px solid #f3f4f6",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Link
                            to={`/llm-dashboard/${selectedProject}/${selectedProjectDomain}?date=${selectedDate}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 16px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: "#ffffff",
                                fontSize: "14px",
                                color: "#374151",
                                cursor: "pointer",
                                fontWeight: "500",
                                textDecoration: "none",
                            }}
                        >
                            View full report <span style={{ fontSize: "12px" }}>→</span>
                        </Link>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default UrlRanking;
