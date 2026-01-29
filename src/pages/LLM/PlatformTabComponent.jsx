import { useMemo, useState } from "react";
import SalesStatisticOne from "./SalesStatisticOne";
import TooltipIcon from "./ToolTipIcon";

const PLATFORM_ICONS = {
    chatgpt: {
        icon: <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/chatgpt.png" alt="chatgpt" />,
        color: '#10A37F',
    },
    gemini: {
        icon: <img width="30" height="30" src="https://img.icons8.com/fluency/30/bard.png" alt="bard" />,
        color: '#4A90E2',
    },
    perplexity: {
        icon: <img width="30" height="30" src="https://img.icons8.com/fluency/30/perplexity-ai.png" alt="perplexity-ai" />,
        color: '#F5A623',
    },
    claude: {
        icon: <img width="30" height="30" src="https://img.icons8.com/fluency/30/claude-ai.png" alt="claude-ai" />,
        color: '#D34C91',
    },
    aimode: {
        icon: (<img width="30" height="30" src="https://img.icons8.com/color/48/google.png" alt="AI Overview" />),
        color: '#FFE082', // Light yellow accent for Google’s AI
    },
};

const LLM_NAME_MAP = {
    chatgpt: "ChatGPT",
    aimode: "AI Mode",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude"
};

const PlatformTabComponent = ({ data, mentions, chartData }) => {
    const [sortConfig, setSortConfig] = useState({ key: "visibilityPercentage", direction: "desc" });

    const totalVisibility = data.reduce((sum, item) => sum + item.visibilityCount, 0);

    // Merge data with mentions count and visibility percentage
    const mergedData = data.map(item => {
        const mentionArray = mentions[`llm_${item.llm}`] || [];
        const mentionsCount = mentionArray.length;
        const visibilityPercentage = mentionsCount ? ((item.visibilityCount * 100) / mentionsCount) : 0;
        return { ...item, mentionsCount, visibilityPercentage };
    });

    const bestPlatform = mergedData.reduce((prev, current) =>
        current.visibilityPercentage > prev.visibilityPercentage ? current : prev
    );

    const weakestPlatform = mergedData.reduce((prev, current) =>
        current.visibilityPercentage < prev.visibilityPercentage ? current : prev
    );

    // Sorted rows for the table
    const sortedRows = useMemo(() => {
        const sorted = [...mergedData];
        sorted.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (typeof aValue === "string") aValue = aValue.toLowerCase();
            if (typeof bValue === "string") bValue = bValue.toLowerCase();

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [mergedData, sortConfig]);

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="col-md-12 mt-20">
            <div className="default-cont">
                {/* Best & Weakest Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', width: '100%' }}>
                    {[bestPlatform, weakestPlatform].map((platform, idx) => {
                        const isBest = idx === 0;
                        const llmKey = LLM_NAME_MAP[platform.llm.toLowerCase()];
                        const llmIcon = PLATFORM_ICONS[platform.llm.toLowerCase()]?.icon || null;

                        return (
                            <div
                                key={platform.llm}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minWidth: 0
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                                        {isBest ? "Best platform" : "Weakest platform"}
                                        <TooltipIcon title={`AI platform where your brand has the ${isBest ? "most visibility" : "least visibility"} in the prompt answers`} />
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {llmIcon}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                        <span style={{ color: 'black', fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {llmKey}
                                        </span>
                                        <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                                            {platform.visibilityPercentage.toFixed(0)}% Visibility
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="col-md-12 mb-10">
                    <SalesStatisticOne
                        aggregatedVisibility={chartData}
                        title="Platform wise visibility trends over time"
                    />
                </div>

                {/* Table */}
                <div className="card h-100">
                    <div className="card-body p-24">
                        <div className="table-responsive" style={{ overflowX: "auto" }}>
                            <table className="table table-sm mb-0 ym-table bordered-table">
                                <thead className="table-light">
                                    <tr className="text-nowrap">
                                        <th onClick={() => handleSort("llm")}>
                                            Platform {sortConfig.key === "llm" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            <TooltipIcon title={"Refers to AI Models like ChatGPT, Claude, Gemini, Perplexity etc."} />
                                        </th>
                                        <th className="text-center" onClick={() => handleSort("visibilityPercentage")}>
                                            Visibility{" "}
                                            {sortConfig.key === "visibilityPercentage" ? (
                                                sortConfig.direction === "asc" ? (
                                                    <span style={{ cursor: "pointer" }}>↑</span>
                                                ) : (
                                                    <span style={{ cursor: "pointer" }}>↓</span>
                                                )
                                            ) : (
                                                ""
                                            )}
                                            <TooltipIcon title={"Percentage of prompts where the brand was mentioned in AI-generated answers. Higher is better."} />
                                        </th>

                                        <th className="text-center" onClick={() => handleSort("visibilityCount")}>
                                            Mentions {sortConfig.key === "visibilityCount" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                                            <TooltipIcon title={"Total brand mentions across prompt answers."} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRows.map(slug => {
                                        const llmKey = LLM_NAME_MAP[slug.llm.toLowerCase()];

                                        const llmIcon = PLATFORM_ICONS[slug.llm.toLowerCase()]?.icon || null;

                                        return (
                                            <tr key={slug.llm} className="text-nowrap">
                                                <td className="d-flex align-items-center">{llmIcon}<span style={{ marginLeft: "8px" }}>{llmKey}</span></td>
                                                <td className="text-center">{slug.visibilityPercentage.toFixed(2)}%</td>
                                                <td className="text-center">{slug.visibilityCount}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformTabComponent;
