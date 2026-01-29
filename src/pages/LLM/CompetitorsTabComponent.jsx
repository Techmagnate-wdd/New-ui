import { useMemo, useState } from "react";
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
};

// const brandToDomain = {
//     bajajfinserv: "bajajfinserv.in",
//     youtube: "youtube.com",
//     livemint: "livemint.com",
//     samsung: "samsung.com",
//     // add more brands here
// };

// const brandToDomain = {
//     bajajfinserv: "bajajfinserv.in",
//     icicibank: "icicibank.com",
//     axisbank: "axisbank.com",
//     kotakbank: "kotak.com",
//     // add more brands here
// };

const getLogoUrl = (domain) => {
    // const normalizedBrand = brand.toLowerCase().replace(/\s+/g, ''); // remove spaces
    // const domain = brandToDomain[normalizedBrand] || "example.com"; // fallback domain
    // return `https://logo.clearbit.com/${domain}`;
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
};

const CompetitorsTabComponent = ({ data, totalPrompt }) => {
    const totalVisibility = data.reduce((acc, slug) => acc + slug.mentions, 0);
    const totalMentions = data.reduce((acc, item) => acc + item.mentions, 0);
    const [sortConfig, setSortConfig] = useState({ key: "visibilityPercentage", direction: "desc" });


    // Calculate visibility percentage for each platform
    const dataWithPercentage = data.map((platform) => ({
        ...platform,
        visibilityPercentage: totalPrompt
            ? (platform.mentions * 100) / totalPrompt
            : 0,
        // visibility: totalPrompt ? ((c.mentions / totalPrompt) * 100).toFixed(2) + "%" : "0%"

    }));

    // Find best and weakest platforms based on percentage
    const bestPlatform = dataWithPercentage.reduce((prev, current) =>
        current.visibilityPercentage > prev.visibilityPercentage ? current : prev
    );
    const weakestPlatform = dataWithPercentage.reduce((prev, current) =>
        current.visibilityPercentage < prev.visibilityPercentage ? current : prev
    );

    // Sort logic
    const sortedData = useMemo(() => {
        const sorted = [...dataWithPercentage];
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
    }, [dataWithPercentage, sortConfig]);

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
                {/* Best & Weakest Cards - Using CSS Grid to force inline layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    width: '100%'
                }}>
                    {[bestPlatform, weakestPlatform].map((platform, idx) => {
                        const isBest = idx === 0;
                        const llmKey = platform.brand
                        const llmIcon = `https://logo.clearbit.com/${llmKey}`
                        const brand = platform.brand

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
                                {/* Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span style={{
                                        // color: '#6b7280',
                                        color: '#1c2024',
                                        fontSize: '0.875rem',
                                        fontWeight: '400'
                                    }}>
                                        <span>
                                            {isBest ?
                                                <div>
                                                    <span>Best competitor</span>
                                                    <a href="#" data-bs-toggle="tooltip" title="Competitor that has the most visibility across prompt answers" className="ms-1">
                                                        <span style={{ color: "grey" }}>
                                                            < TooltipIcon title={"Competitor that has the most visibility across prompt answers."} />
                                                        </span>
                                                    </a>
                                                    {/* <span>?</span> */}
                                                </div>
                                                :
                                                <div>
                                                    <span>
                                                        Weakest competitor
                                                    </span>
                                                    <a href="#" data-bs-toggle="tooltip" title="Competitor that has the least visibility across prompt answers." className="ms-1">
                                                        <span style={{ color: "grey" }}>
                                                            < TooltipIcon title={"Competitor that has the least visibility across prompt answers"} />
                                                        </span>
                                                    </a>
                                                </div>
                                            }
                                        </span>
                                    </span>
                                    <span style={{
                                        marginLeft: '0.25rem',
                                        color: '#9ca3af',
                                        fontSize: '0.875rem',
                                        cursor: 'help'
                                    }}>
                                    </span>
                                </div>

                                {/* Platform Details */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <img width="30" height="30"
                                            // src={llmIcon} 
                                            src={getLogoUrl(platform.domain)}

                                        />
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        color: "#1d4ed8"
                                    }}>
                                        <h6 className="" style={{ color: "#1d4ed8" }}>
                                            {brand}
                                            {/* {brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()} */}
                                        </h6>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minWidth: 0
                                }}>
                                    <span style={{
                                        color: 'black',
                                        fontSize: '1.125rem',
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',

                                    }}>
                                        {platform.llm}
                                    </span>
                                    <span
                                        style={{
                                            color: '#4b5563',
                                            fontSize: '0.875rem',
                                            paddingTop: "5px"
                                        }}
                                    >
                                        {platform.visibilityPercentage.toFixed(0)}% Visibility
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* // table */}
                <div className="card h-100">
                    <div className="card-body p-24">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-12">
                            <div>
                                <span className="mb-2" style={{ color: "#1c2024", lineHeight: "1.7 rem", fontSize: "20px", fontWeight: 500 }}>
                                    Competitor Analysis
                                </span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive" style={{ overflowX: "auto" }}>
                            <table className="table table-sm mb-0 ym-table bordered-table">
                                <thead className="table-light">
                                    <tr className="text-nowrap">
                                        <th>Brand</th>
                                        {/* <th className="text-center">
                                            <span>
                                                Visibility
                                                < TooltipIcon title={"The percentage of prompts where the brand was mentioned in AI-generated answers. Higher is better."} />
                                            </span>

                                        </th> */}
                                        <th
                                            className="text-center"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleSort("visibilityPercentage")}
                                        >
                                            Visibility{" "}
                                            {sortConfig.key === "visibilityPercentage" ? (
                                                sortConfig.direction === "asc" ? (
                                                    <span>↑</span>
                                                ) : (
                                                    <span>↓</span>
                                                )
                                            ) : (
                                                ""
                                            )}
                                            <TooltipIcon title="The percentage of prompts where the brand was mentioned in AI-generated answers. Higher is better." />
                                        </th>
                                        <th className="text-center">
                                            <span>
                                                Mentions
                                                < TooltipIcon title={"Total brand mentions across prompts. Each brand is counted once per prompt, regardless of how many times it appears in the same prompt's answers."} />
                                            </span>

                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((slug) => {
                                        const llmKey = slug.brand;
                                        return (
                                            <tr key={`${slug.llm}`} className="text-nowrap">
                                                <td className="d-flex align-items-center">
                                                    <img
                                                        style={{ border: "1px solid white", borderRadius: "50%" }}
                                                        width="30px"
                                                        src={slug.domain === "axisbank.com" ? "axisbank.jpg" : getLogoUrl(slug.domain)}
                                                    />
                                                    <span style={{ marginLeft: "20px" }}>
                                                        {slug.brand}
                                                        {/* {slug.brand.charAt(0).toUpperCase() + slug.brand.slice(1).toLowerCase()} */}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {`${slug.visibilityPercentage.toFixed(2)} %`}
                                                </td>
                                                <td className="text-center">{slug.mentions}</td>
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

export default CompetitorsTabComponent;