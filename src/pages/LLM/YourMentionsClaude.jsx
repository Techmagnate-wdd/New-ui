import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLLMRanks } from "../../services/api";
import dayjs from "dayjs";
import { ExternalLink } from "lucide-react";

const safeDecode = (v) => {
    try {
        return decodeURIComponent(v || "").replace(/\+/g, " ");
    } catch {
        return v;
    }
};

const formatModelName = (m) => {
    switch (m) {
        case "llm_gemini":
            return "Gemini";
        case "llm_chatgpt":
            return "ChatGPT-4";
        case "llm_perplexity":
            return "sonar-reasoning";
        case "llm_claude":
            return "claude-opus-4-0";
        default:
            return m || "Unknown";
    }
};

const YourMentionsPerplexity = ({
    endpoint = "/api/mentions?period=7d",
    fetchOnMount = true,
    projectId = "68b1aeafcd9023431e1a2586",
    model = "llm_claude",
    data
}) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    return (
        <div className="col">
            <div className="card h-100">
                <div className="card-body p-24">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-12">
                        <div>
                            <h6 className="mb-2" style={{ color: "#000", fontWeight: 700 }}>
                                Your Mentions Claude
                            </h6>
                            <p className="mb-0 text-secondary small">all mentions of your brands across different AI models</p>
                        </div>

                        <div className="d-flex gap-2">
                            <Link to="/llm-rankings-perplexity" className="btn btn-sm">
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
                                    <th className="text-center" style={{ width: 88 }}>
                                        Url
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((r, i) => (
                                    <tr key={r.id || `row-${i}`} className="text-nowrap">
                                        <td className="text-truncate" style={{ maxWidth: 200 }}>
                                            {safeDecode(r.keyword)}
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: 520 }}>
                                            {formatModelName(model)}
                                        </td>
                                        <td className="text-center">{r.citations.length || 0}</td>
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

export default YourMentionsPerplexity;
