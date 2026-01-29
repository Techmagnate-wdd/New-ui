import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { Spinner } from "react-bootstrap";
import { getCompetitorRanks } from "../../services/api";

const CompetitorRankings = ({
    projectId,
    startDate,
    endDate,
    slug = "llm_chatgpt",
    excludeTarget = false,
    projectTargetDomain = null,
    topN = null,
    className = "",
    onDomainsChange, 
}) => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const buildFiltersObject = () => {
        const f = { project: projectId };
        if (startDate) f.startDate = dayjs(startDate).format("YYYY-MM-DD");
        if (endDate) f.endDate = dayjs(endDate).format("YYYY-MM-DD");
        return f;
    };

    const fetchDomains = async () => {
        if (!projectId) {
            setDomains([]);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            // IMPORTANT: pass a plain object to your API helper (not stringified)
            const filtersObj = buildFiltersObject();

            // call your axios-style helper
            // adjust page/limit as needed; using large limit to fetch all domains
            const page = 1;
            const limit = 1000;
            const resp = await getCompetitorRanks(page, limit, filtersObj, slug);

            // axios response shape -> resp.data
            const json = resp?.data;
            if (!json) {
                throw new Error("Invalid response from server");
            }

            // backend should return json.data.domains as array
            let list = Array.isArray(json?.data?.domains) ? json.data.domains : [];

            // optionally exclude project domain
            if (excludeTarget && projectTargetDomain) {
                const t = projectTargetDomain.replace(/^www\./i, "").toLowerCase();
                list = list.filter((d) => (d.domain || "").toLowerCase() !== t);
            }

            // ensure sort by count desc
            list.sort((a, b) => (b.count || 0) - (a.count || 0));

            // limit rows if topN provided
            if (topN && Number.isFinite(topN)) {
                list = list.slice(0, topN);
            }

            setDomains(list);
            if (typeof onDomainsChange === "function") {
                onDomainsChange(list);
            }
        } catch (err) {
            console.error("DomainRankings fetch error:", err);
            setError("Failed to load domain rankings.");
            setDomains([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, startDate, endDate, slug, excludeTarget, projectTargetDomain, topN]);

    return (
        <div className={`card shadow-sm mt-20 ${className}`}>
            <div className="card-header py-8 px-24 bg-base">
                <h6 className="mb-0" style={{ color: "#4a4a4a" }}>Domain Rankings</h6>
            </div>

            <div className="card-body p-24 pt-10">
                {loading ? (
                    <div className="text-center p-4">
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <div className="text-danger small">{error}</div>
                ) : domains.length === 0 ? (
                    <div className="small text-muted">No domains found for selected project / date range.</div>
                ) : (
                    <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                        <table className="table custom-table"
                            style={{
                                border: "1px solid #ddd",
                                minWidth: "1000px" // Set minimum width to ensure columns don't shrink too much
                            }}
                        >
                            <thead className="table-light">
                                <tr>
                                    <th style={{
                                        color: "#333333",
                                        padding: "14px 20px",
                                    }}>#</th>
                                    <th style={{
                                        color: "#333333",
                                        padding: "14px 20px",
                                        minWidth: "200px"
                                    }}>Domain</th>
                                    <th style={{
                                        color: "#333333",
                                        padding: "14px 20px",
                                        minWidth: "200px"
                                    }}>Total Mentions</th>
                                    <th style={{
                                        color: "#333333",
                                        padding: "14px 20px",
                                        minWidth: "200px"
                                    }}>Average Ranking</th>
                                </tr>
                            </thead>
                            <tbody>
                                {domains.map((d, idx) => (
                                    <tr key={d.domain || idx}>
                                        <td style={{
                                            color: "#4B5563",
                                            padding: "14px 20px",
                                            wordBreak: "break-word"
                                        }}>{idx + 1}</td>
                                        <td style={{
                                            color: "#4B5563",
                                            padding: "14px 20px",
                                            minWidth: "200px",
                                            wordBreak: "break-word"
                                        }}>{d.domain}</td>
                                        <td style={{
                                            color: "#4B5563",
                                            padding: "14px 20px",
                                            minWidth: "200px",
                                            wordBreak: "break-word"
                                        }}>{d.count ?? "-"}</td>
                                        <td style={{
                                            color: "#4B5563",
                                            padding: "14px 20px",
                                            minWidth: "200px",
                                            wordBreak: "break-word"
                                        }}>
                                            {d.averagePosition !== null && d.averagePosition !== undefined
                                                ? Number(d.averagePosition).toFixed(2)
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

CompetitorRankings.propTypes = {
    projectId: PropTypes.string.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    slug: PropTypes.string,
    excludeTarget: PropTypes.bool,
    projectTargetDomain: PropTypes.string,
    topN: PropTypes.number,
    className: PropTypes.string,
    onDomainsChange: PropTypes.func,
};

export default CompetitorRankings;
