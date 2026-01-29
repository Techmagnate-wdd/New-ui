import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLLMRanks } from "../../services/api";
import { ExternalLink } from "lucide-react";

const safeDecode = (v) => {
    try {
        return decodeURIComponent(v || "").replace(/\+/g, " ");
    } catch {
        return v;
    }
};

const YourMentionsChatgpt = ({
    data,
    endpoint = "/api/mentions?period=7d",
    fetchOnMount = true,
    projectId = "68b1a8a65b258274ba50a04b",
    model = "llm_chatgpt",
}) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    return (
        <div className="col">
            <div className="card h-100">
                <div className="card-body p-24">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-12">
                        <div>
                            <h6 className="mb-2" style={{ color: "#000", fontWeight: 700 }}>
                                Your Mentions chatGPT
                            </h6>
                            <p className="mb-0 text-secondary small">all mentions of your brands across different AI models</p>
                        </div>

                        <div className="d-flex gap-2">
                            <Link to="/llm-rankings" className="btn btn-sm">
                                <ExternalLink size={16} color="#6c757d" />
                            </Link>
                        </div>
                    </div>

                    {/* Loading / Error / Table */}
                    {loading && (
                        <div className="mb-3">
                            <small className="text-muted">Loading mentions…</small>
                        </div>
                    )}

                    {err && (
                        <div className="alert alert-warning py-2" role="alert">
                            <small className="text-danger">Error: {err}</small>
                        </div>
                    )}

                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                        <table className="table table-sm mb-0 ym-table bordered-table">
                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr className="text-nowrap">
                                    <th>Prompt</th>
                                    <th>LLM</th>
                                    <th>Total Mentions</th>
                                    <th className="text-center" style={{ width: 88 }}>
                                        #Rank
                                    </th>
                                    <th className="text-center">
                                        Url
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((r, i) => (
                                    <tr key={r.id || `row-${i}`} className="text-nowrap">
                                        <td className="text-truncate" style={{ maxWidth: 200 }}>
                                            {safeDecode(r.keyword)}
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: 520 }}>
                                            ChatGPT-4
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: 520 }}>
                                            {r.citations.length || 0}
                                        </td>
                                        <td className="text-center">{r.rank || "No rank"}</td>
                                        <td className="text-center">{r.url || ""}</td>
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

export default YourMentionsChatgpt;
