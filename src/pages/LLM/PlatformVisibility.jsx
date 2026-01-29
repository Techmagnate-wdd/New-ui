import TooltipIcon from "./ToolTipIcon";

const PLATFORM_COLORS = ["#a5b4fc", "#c4b5fd", "#ddd6fe", "#fcd34d", "#FFE082"]; // Colors for bars
const PLATFORM_ICONS = {
    chatgpt: {
        icon: <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/chatgpt.png" alt="chatgpt" />,
        color: '#B7C7EB',
    },
    gemini: {
        icon: <img width="48" height="48" src="https://img.icons8.com/fluency/48/bard.png" alt="bard" />,
        color: '#CAD6F1',
    },
    perplexity: {
        icon: <img width="48" height="48" src="https://img.icons8.com/fluency/48/perplexity-ai.png" alt="perplexity-ai" />,
        color: '#DBE2F4',
    },
    claude: {
        icon: <img width="48" height="48" src="https://img.icons8.com/fluency/48/claude-ai.png" alt="claude-ai" />,
        color: '#F0F4FF',
    },
    aimode: {
        icon: (<img width="48" height="48" src="https://img.icons8.com/color/48/google.png" alt="AI Overview" />),
        // color: '#FFE082',
        color: '#C7D2FE',
    },
};

const LLM_NAME_MAP = {
    chatgpt: "ChatGPT",
    aimode: "AI Mode",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude"
};

// Download icon component
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
);

const PlatformVisibility = ({ data, mentions, setActiveTab }) => {
    if (!data || !data.length) return null;

    const totalVisibility = data.reduce((sum, item) => sum + item.visibilityCount, 0);

    const mergedData = data.map((item) => {
        // Get the array of mentions for this LLM
        const mentionArray = mentions[`llm_${item.llm}`] || [];
        return {
            ...item,
            mentionsCount: mentionArray.length, // or calculate differently if needed
        };
    });

    // Map data to include percentage, icon, and color
    const platformData = mergedData.map((item, index) => {
        const llmData = PLATFORM_ICONS[item.llm.toLowerCase()] || {};
        return {
            // name: item.llm.charAt(0).toUpperCase() + item.llm.slice(1),
            name: LLM_NAME_MAP[item.llm.toLowerCase()],
            percentage: item && item.mentionsCount > 0
                ? Math.round((item.visibilityCount * 100) / item.mentionsCount) : 0,
            icon: llmData.icon || null, // <-- Use the actual URL
            color: llmData.color || PLATFORM_COLORS[index % PLATFORM_COLORS.length],
        };
    });

    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
                margin: "20px auto",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "20px 14px",
                    borderBottom: "1px solid #f3f4f6",
                    // display: "flex",
                    // justifyContent: "space-between",
                    // alignItems: "center",
                }}
            >
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <div
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#1c2024",
                            // color: "#4b5563",
                            // margin: 0,
                        }}
                    >
                        Platform wise brand visibility
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
                    {/* <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#6b7280",
                            fontSize: "12px",
                            textDecoration: "underline",
                            textDecorationStyle: "dotted",
                            cursor: "pointer",
                        }}
                    >
                        <span
                            style={{
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                backgroundColor: "#d1d5db",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "9px",
                                color: "#ffffff",
                            }}
                        >
                            i
                        </span>
                        Learn more
                    </div> */}
                </div>

                {/* <button
                    style={{
                        width: "36px",
                        height: "36px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#6b7280",
                    }}
                >
                    ⬇
                </button> */}
            </div>

            {/* Table Header */}
            <div
                style={{
                    display: "flex",
                    padding: "9px 14px",
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                    }}
                >
                    Platform
                </div>
                <div
                    style={{
                        width: "100px",
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "4px",
                    }}
                >
                    Visibility
                    <span
                    // style={{
                    //     width: "14px",
                    //     height: "14px",
                    //     borderRadius: "50%",
                    //     backgroundColor: "#d1d5db",
                    //     display: "inline-flex",
                    //     alignItems: "center",
                    //     justifyContent: "center",
                    //     fontSize: "9px",
                    //     color: "#ffffff",
                    // }}
                    >
                        < TooltipIcon title={"The percentage of prompts where the brand was mentioned in AI-generated answers. Higher is better."} />
                    </span>
                </div>
            </div>

            {/* Platform Rows */}
            <div>
                {platformData.map((platform, index) => {
                    return (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "9px 12px",
                                borderBottom:
                                    index < platformData.length - 1 ? "1px solid #f3f4f6" : "none",
                                position: "relative",
                            }}
                        >
                            {/* Background bar */}
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${platform.percentage * 2}%`, // Scale for visual effect
                                    backgroundColor: platform.color,
                                    opacity: 0.6,
                                    zIndex: 1,
                                }}
                            />

                            {/* Content */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    flex: 1,
                                    position: "relative",
                                    zIndex: 2,
                                }}
                            >
                                <div
                                    style={{
                                        width: "23px",
                                        height: "23px",
                                        borderRadius: "50%",
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "16px",
                                    }}
                                >
                                    {platform.icon}
                                </div>

                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#111827",
                                    }}
                                >
                                    {platform.name}
                                </span>
                            </div>

                            <div
                                style={{
                                    width: "100px",
                                    textAlign: "right",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#111827",
                                    position: "relative",
                                    zIndex: 2,
                                }}
                            >
                                {platform.percentage}%
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Footer */}
            <div
                style={{
                    padding: "100px 24px",
                    borderTop: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <button
                    onClick={() => setActiveTab("Platforms")}
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
    )
}

export default PlatformVisibility
