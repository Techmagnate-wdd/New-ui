import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#8b5cf6", "#22c55e", "#eab308", "#ec4899", "#f87171"];
// const COLORS = [

    
//     "#6BAB44",
//     "#21357B",
//     "#008080",
//     "#FF6600"
// ]


const DownloadIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
);

const toTitleCase = (str) => {
    if (!str) return "";

    let spaced = str.replace(/([a-z])([A-Z])/g, '$1 $2');

    spaced = spaced.replace(/[-_]/g, ' ');

    if (spaced === spaced.toLowerCase() && spaced.includes("path")) {
        spaced = spaced.replace(/path/i, " Path");
    }

    return spaced
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};


// Custom Tooltip for Pie slices
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value, fill } = payload[0];
        return (
            <div
                style={{
                    background: "#fff",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    fontSize: "0.85rem",
                }}
            >
                <span style={{ fontWeight: 600, color: fill }}>{name}</span>
                <span>: {value}%</span>
            </div>
        );
    }
    return null;
};

const MarketShare = ({ data = [], setActiveTab }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (!data.length) return;

        const totalMentions = data.reduce((sum, c) => sum + (c.mentions || 0), 0);
        const processed = data.map((item) => ({
            name: item.brand,
            value: totalMentions ? parseFloat(((item.mentions / totalMentions) * 100).toFixed(2)) : 0,
        }));

        setChartData(processed);
    }, [data]);

    return (
        <div className="card shadow-sm">
            <div className="">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3"
                    style={{
                        padding: "15px",
                        borderBottom: "1px solid #dfdfdf"
                    }
                    }
                >
                    <div>
                        <div className="mb-0" style={{ color: "#000", fontWeight: 500, fontSize: "1.25rem" }}>
                            Market share
                        </div>
                        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "12px", marginTop: "7px" }}>
                            Distribution of visibility across competitors
                        </p>
                    </div>
                    {/* <button
                        style={{
                            backgroundColor: "#fff",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            padding: "6px 10px",
                        }}
                    >
                        <DownloadIcon />
                    </button> */}
                </div>

                {/* Chart + Competitor list */}
                <div className="d-flex align-items-center justify-content-center" style={{ height: 220 }}>
                    {/* Pie Chart */}
                    <div style={{ width: "55%", height: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="65%"
                                    outerRadius="85%"
                                    paddingAngle={2}
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Competitor list */}
                    <div style={{ width: "45%", paddingLeft: 12 }}>
                        <ul className="list-unstyled mb-0">
                            {chartData.map((item, index) => (
                                <li
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginBottom: "8px",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            backgroundColor: COLORS[index % COLORS.length],
                                            display: "inline-block",
                                        }}
                                    ></span>
                                    <span>{toTitleCase(item.name)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "18px 24px",
                        borderTop: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <button
                        onClick={() => setActiveTab("Competitors")}
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
                        View full report
                        <span style={{ fontSize: "12px" }}>→</span>
                    </button>
                </div>
            </div>
        </div >
    );
};

export default MarketShare;
