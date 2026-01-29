// YourMentions.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

/** Error boundary to ensure static UI even if render blows up */
class YMBoundary extends React.Component {
    constructor(p) { super(p); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch() { }
    render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// Static fallback rows (used initially and on any failure)
const FALLBACK = [
    {
        rank: 3,
        model: "Meta Llama 3.3 70B",
        position: 5.5,
        score: 2,
    },
    {
        rank: 13,
        model: "Gemini",
        position: 5.5,
        score: 2,
    },
    {
        rank: 2,
        model: "DeepSeek R1",
        position: 5.5,
        score: 2,
    },
    {
        rank: 3,
        model: "DeepSeek R1",
        position: 5.5,
        score: 2,
    },
];

const ModalPerformance = ({
    endpoint = "/api/mentions?period=7d",
    fetchOnMount = false, // turn true when your API is ready
}) => {
    const [rows, setRows] = useState(FALLBACK);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
            const ct = res.headers.get("content-type") || "";
            if (!res.ok || !ct.includes("application/json")) throw new Error(`Invalid response (${res.status})`);
            const data = await res.json();
            const items = Array.isArray(data) ? data : data?.items;
            if (!Array.isArray(items)) throw new Error("Malformed payload");

            setRows(items.map((r) => ({
                prompt: r.prompt ?? "-",
                model: r.model ?? "-",
                rank: typeof r.rank === "number" ? r.rank : Number(r.rank) || "-",
            })));
        } catch (e) {
            setRows(FALLBACK);
            setErr(e?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => { if (fetchOnMount) fetchData(); }, [fetchOnMount, fetchData]);

    const Card = (
        <div className="">{/* 50% width on xl+ */}
            <div className="card h-100">
                <div className="card-body p-24">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-12">
                        <div>
                            <h5 className="mb-2" style={{ color: "#000", fontWeight: 700 }}>AI Performance Score</h5>
                            <p className="mb-0 text-secondary small">all mentions brands</p>
                        </div>
                        {/* Optional actions */}
                        <div className="d-flex gap-2">
                            <Link to="/mentions" className="btn btn-sm btn-outline-secondary">Open</Link>

                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                        <table className="table table-sm mb-0 ym-table bordered-table">
                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr className="text-nowrap">
                                    <th className="text-center" style={{ width: 88 }}># Rank</th>
                                    <th>AI Model</th>
                                    <th>AVG. Position</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={`${r.model}-${i}`} className="text-nowrap">
                                        <td className="text-center">{r.rank}</td>
                                        <td className="text-truncate" style={{ maxWidth: 520 }}>{r.model}</td>
                                        <td className="text-truncate" style={{ maxWidth: 520 }}>{r.position}</td>
                                        <td className="text-truncate" style={{ maxWidth: 520 }}>{r.score}</td>
                                    </tr>
                                ))}
                                {err && (
                                    <tr>
                                        <td colSpan={3} className="small text-danger py-2">
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

    return (
        <YMBoundary
            fallback={
                <div className="col-xxl-6 col-xl-6">
                    <div className="card h-100">
                        <div className="card-body p-24">
                            <div className="d-flex justify-content-between align-items-start mb-12">
                                <div>
                                    <h5 className="mb-2" style={{ color: "#000", fontWeight: 700 }}>Your Mentions</h5>
                                    <p className="mb-0 text-secondary small">all mentions brands</p>
                                </div>
                            </div>
                            <div className="table-responsive" style={{ overflowX: "auto" }}>
                                <table className="table table-sm mb-0 ym-table bordered-table">
                                    <thead className="table-light">
                                        <tr className="text-nowrap">
                                            <th className="text-center"># Rank</th>
                                            <th>Model</th>
                                            <th>AVG. Position</th>
                                            <th>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {FALLBACK.map((r, i) => (
                                            <tr key={`fb-${i}`} className="text-nowrap">
                                                <td className="text-center">{r.rank}</td>
                                                <td className="text-truncate" style={{ maxWidth: 200 }}>{r.model}</td>
                                                <td className="text-truncate" style={{ maxWidth: 520 }}>{r.position}</td>
                                                <td className="text-truncate" style={{ maxWidth: 520 }}>{r.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            {Card}
        </YMBoundary>
    );
};

export default ModalPerformance;
