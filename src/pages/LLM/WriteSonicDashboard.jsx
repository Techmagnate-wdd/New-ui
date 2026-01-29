import { useContext, useEffect, useRef, useState } from "react";
import Citations from "./Citations";
import IndustryRanking from "./IndustryRanking";
import ModalPerformance from "./ModalPerformance";
import SalesStatisticOne from "./SalesStatisticOne";
import YourMentionsChatgpt from "./YourMentionsChatgpt";
import YourMentionsClaude from "./YourMentionsClaude";
import YourMentionsGemini from "./YourMentionsGemini";
import YourMentionsPerplexity from "./YourMentionsPerplexity";
import { downloadExcel, getCitations, getLLMProjects, getMyPagesCount, getMyPagesCount1, llmProjects } from "../../services/api";
import { Icon } from "@iconify/react";
import { Tooltip } from 'react-tooltip';
import LLMAnalyticsCard from "./LLMAnalyticsCard";
import PlatformVisibility from "./PlatformVisibility";
import RankSummary from "./RankSummary";
import UrlRanking from "./UrlRanking";
import TopKeywords from "./TopKeywords";
import PlatformTabComponent from "./PlatformTabComponent";
import CompetitorsTabComponent from "./CompetitorsTabComponent";
import MarketShare from "./MarketShare";
import WriteSonicAllCitations from "./WriteSonicAllCitations";
import { Link, useNavigate } from "react-router-dom";
import TooltipIcon from "./ToolTipIcon";
import { DatePicker } from "antd";
import { useLLM } from "../../context/LLMContext";
import AuthContext from "../../context/AuthContext";
const PLATFORMS = ["ChatGPT", "Perplexity", "Gemini", "Claude"];

const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

function getCircleConfig(percentage) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;

    const safePercent = Math.max(0, Math.min(percentage, 100));
    const offset = circumference - (safePercent / 100) * circumference;

    return {
        radius,
        circumference,
        offset,
        strokeWidth: 3,
        backgroundColor: "#e6e6e6", // light grey
        progressColor: "#A97442",   // yellow
    };
}

const LLM_NAME_MAP = {
    chatgpt: "ChatGPT",
    ai_overview: "AI Mode",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude"
};


const WriteSonicDashboard = ({ setPromptData }) => {
    const navigate = useNavigate()
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedProjectDomain, setSelectedProjectDomain] = useState("");
    const [selectedProjectBrand, setSelectedProjectBrand] = useState("");
    const [citationsData, setCitationsData] = useState(null);
    const [chatgptData, setChatgptData] = useState([]);
    const [perplexityData, setPerplexityData] = useState([]);
    const [geminiData, setGeminiData] = useState([]);
    const [claudeData, setClaudeData] = useState([]);
    const [industryData, setIndustryData] = useState([])
    const [visibilityData, setVisibilityData] = useState({});
    const [interval, setInterval] = useState("daily");
    const [totalDomainMatches, setTotalDomainMatches] = useState(0);
    const [promptRanking, setPromptRanking] = useState({ ranked: 0, total: 0 });
    const [averagePosition, setAveragePosition] = useState(0);
    const [exportLoading, setExportLoading] = useState(false)
    const [brandVisibility, setBrandVisibility] = useState({});
    const [totalBrandVisibility, setTotalBrandVisibility] = useState(0);
    const [myCitedPage, setMyCitedPage] = useState(0);
    const [myCompetitorShare, setMyCompetitorShare] = useState("");
    const [myCompetitorPosition, setMyCompetitorPosition] = useState(0);
    const [competitorPercentages, setCompetitorPercentages] = useState({})
    const [llmTimelineData, setLLMTimelimeData] = useState({});
    const [totalPagesCited, setTotalPagesCited] = useState(0)
    const [rankSummary, setRankSummary] = useState({});
    const [topUrlData, setTopUrlData] = useState([]);
    const [topKeywordsData, setTopKeywordsData] = useState([]);
    const [activeTab, setActiveTab] = useState("General");
    const [llmResults, setLLMResults] = useState([])
    const tabs = ["General", "Platforms", "Competitors"];
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [myPagesCited, setMyPagesCited] = useState(0)
    const [loading, setLoading] = useState(false)
    const { setTotalAnswers, setLLMProjectId, SetPromptsSelectedDate } = useLLM();
    
    const [selectedDate, setSelectedDate] = useState("");
    const [defaultDate, setDefaultDate] = useState("");
    const [myPagesCount, setMyPagesCount] = useState()
    const [platforms, setPlatforms] = useState([])
    const { user } = useContext(AuthContext);
    const userRole = user?.role || "";

    useEffect(() => {
        if (platforms.length > 0) {
            setSelectedPlatforms(platforms); // ✅ preselect all available ones
        }
    }, [platforms]);

    useEffect(() => {
    }, [projects, userRole]);

    const handleProjectChange = (projectId) => {
        const selected = projects.find((p) => p._id === projectId);
        if (!selected) return;

        setSelectedProject(projectId);
        setSelectedProjectDomain(selected.target || "");
        setSelectedProjectBrand(selected.brand || "");
        setDefaultDate(selected.created_at || "");
        setPlatforms(selected.type || []);
        localStorage.setItem("selectedProject", projectId);
    };

    // Toggle platform selection
    const togglePlatform = (platform) => {
        const updated = selectedPlatforms.includes(platform)
            ? selectedPlatforms.filter((p) => p !== platform)
            : [...selectedPlatforms, platform];

        setSelectedPlatforms(updated);
        setOpen(false)
        fetchCitations(selectedProject, updated); // call API on each checkbox change
    };
    // Fetch citations for selected project
    const fetchCitations = async (projectId, platforms = selectedPlatforms) => {
        if (!projectId) return;
        setLLMResults(null);
        setChatgptData([]);
        setPerplexityData([]);
        setGeminiData([]);
        setClaudeData([]);
        setCitationsData(null);
        setVisibilityData({});
        setBrandVisibility({});
        setCompetitorPercentages({});
        setRankSummary({});
        setTopUrlData([]);
        setTopKeywordsData([]);
        setLLMTimelimeData([]);
        setTotalPagesCited(0);
        setMyPagesCited(0);
        setTotalBrandVisibility(0);
        setIndustryData([]);
        setMyCompetitorShare("0%");
        setMyCompetitorPosition("#0");
        setMyPagesCount()
        setLoading(true)
        try {
            const response = await getCitations({
                projectId, platforms,
                selectedDate: selectedDate || null, // ✅ Pass selected date
            });
            const chatgpt = response.data.data.llmResults.llm_chatgpt || [];
            const perplexity = response.data.data.llmResults.llm_perplexity || [];
            const gemini = response.data.data.llmResults.llm_gemini || [];
            const claude = response.data.data.llmResults.llm_claude || [];
            const llmResults = response.data.data.llmResults

            setLLMResults(llmResults)
            setChatgptData(chatgpt)
            setPerplexityData(perplexity)
            setGeminiData(gemini)
            setClaudeData(claude)
            setCitationsData(response.data.data);
            setVisibilityData(response.data.data.visibilityTimeline || {});
            setBrandVisibility(response.data.data.brand_visibility || {});

            const totalCompetitorsCount = Object.values(competitorPercentages)
                .reduce((sum, obj) => {
                    const value = Object.values(obj)[0];
                    return sum + value;
                }, 0);

            let topCompetitorsData = response.data.data.topCompetitors; // assume it's an array of competitor objects

            // ✅ Recalculate percentage per competitor and build object
            let totalPercentages = {};

            if (Array.isArray(topCompetitorsData) && promptRanking) {
                topCompetitorsData.forEach((competitor) => {
                    const brand = competitor.brand; // depends on your data structure
                    const percent = ((competitor.mentions * 100) / promptRanking.total).toFixed(2);
                    totalPercentages[brand] = Number(percent);
                });
            }

            // ✅ Update state with object
            setCompetitorPercentages(response.data.data.competitorPercentages);
            setDefaultDate(response.data.data.latestDate)
            setRankSummary(response.data.data.rankSummary || {});
            setTopUrlData(response.data.data.topUrlKeywordData)
            setTopKeywordsData(response.data.data.topKeywords)
            setLLMTimelimeData(response.data.data.llmPercentages)
            // setTotalPagesCited(response.data.data.totalUrlsCount)
            setTotalPagesCited(response.data.data.uniqueUrlsCount)
            setMyPagesCited(response.data.data.myPagesCited)

            const totalBrandVisibilityCount = response.data.data.brand_visibility.reduce((sum, item) => sum + (item.visibilityCount || 0), 0)

            setTotalBrandVisibility(
                Array.isArray(response.data.data.brand_visibility)
                    ? totalBrandVisibilityCount
                    : 0
            );
            // let industryData = response.data.data.topCompetitors
            let industryData = response.data.data.fixedCompetitors
            setIndustryData(industryData || {});

            const targetDomain = response.data.data.targetDomain

            const totalMentions = industryData.reduce((sum, c) => sum + c.mentions, 0);
            const myMentions = industryData.find(c => c.domain === targetDomain)?.mentions || 0;
            const myWeightage = ((myMentions / (totalMentions)) * 100).toFixed(2);

            const sorted = [...industryData].sort((a, b) => b.mentions - a.mentions);
            const myPosition = sorted.findIndex(c => c.domain === targetDomain) + 1;

            setMyCompetitorShare(`${myWeightage}%`);
            setMyCompetitorPosition(`#${myPosition}`);

            // --- Calculate total URLs across all LLMs ---
            const allLLMData = [...chatgpt, ...perplexity, ...gemini, ...claude];
            let totalPrompts = allLLMData.length

            const used = 138;
            const total = 150;
            // setPromptData({ used, total })

        } catch (err) {
            console.error("Error fetching citations:", err);
        } finally {
            setLoading(false)
        }
    };

    const getMyPages = async () => {
        try {
            const response = await getMyPagesCount(selectedProject);
            setMyPagesCount(response.data.totalCount)
        } catch (err) {
            console.log(err, "err")
        }
    }

    const getMyPages1 = async () => {
        try {

            const response = await getMyPagesCount1({
                selectedProject,
                selectedDate: selectedDate || null,
            });
            setMyPagesCount(response.data.totalCount)
        } catch (err) {
            console.log(err, "err")
        }
    }
    
    useEffect(() => {
        if (selectedProject) {
            getMyPages1()
        }
    }, [selectedProject, selectedDate])

    useEffect(() => {
        if (llmResults) {
            const total = Object.values(llmResults).reduce((sum, arr) => sum + arr.length, 0);
            setTotalAnswers(total);
            setLLMProjectId(selectedProject);
            SetPromptsSelectedDate(selectedDate)
        }
    }, [llmResults, setTotalAnswers]);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await getLLMProjects({}, user._id);
                if (res.data && Array.isArray(res.data.projects)) {
                    const allProjects = res.data.projects;
                    setProjects(allProjects);

                    // Try to restore from localStorage
                    const storedProjectId = localStorage.getItem("selectedProject");
                    const selected =
                        allProjects.find(p => p._id === storedProjectId) || allProjects[0];

                    if (selected) {
                        setSelectedProject(selected._id);
                        setSelectedProjectDomain(selected.target || "");
                        setSelectedProjectBrand(selected.brand || "");
                        setDefaultDate(selected.created_at || "");
                        setPlatforms(selected.type || []);
                        localStorage.setItem("selectedProject", selected._id);
                    }
                }
            } catch (err) {
                console.error("Error fetching LLM projects:", err);
            }
        };

        init();
    }, [user._id]);

    // Fetch citations whenever selectedProject changes
    useEffect(() => {
        if (selectedProject && platforms.length > 0) {
            fetchCitations(selectedProject, platforms);
        }
        // }, [selectedProject, interval, activeTab, selectedPlatforms, selectedDate]);
    }, [selectedProject, selectedDate, platforms]);

    useEffect(() => {
        if (!citationsData) return;

        const llmResults = citationsData.llmResults || {};
        let matches = 0;
        let totalTasks = 0;
        let rankedTasks = 0;
        let sumRanks = 0;


        Object.values(llmResults).forEach((tasks) => {
            totalTasks += tasks.length;
            tasks.forEach((task) => {
                // Task has rank if rank !== null
                if (task.rank !== null) {
                    rankedTasks += 1;
                    sumRanks += task.rank;
                }
                // Count citations for total domain matches
                matches += task.citations.length;
            });
        });

        setTotalDomainMatches(matches);
        setPromptRanking({ ranked: rankedTasks, total: totalTasks });
        setAveragePosition(totalTasks > 0 ? (sumRanks / totalTasks).toFixed(2) : 0);


    }, [citationsData]);

    const exportData = async () => {
        try {
            setExportLoading(true);

            const exportFilter = {
                ...(selectedProject && { projectId: selectedProject }),
            };

            const response = await downloadExcel(exportFilter);

            // Create a Blob from the ArrayBuffer
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // Generate download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "LLM_Ranks.xlsx"); // file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // clean up
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setExportLoading(false);
        }
    };
    // Close card if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const storedProject = localStorage.getItem("selectedProject");
        if (storedProject) {
            setSelectedProject(storedProject);
        }
    }, []);

    return (
        <>
            <div className="card1 shadow-sm mb-4"
                style={{
                    padding: "13px",
                    background: " #fff",
                    borderTop: "1px solid #ebeecf",
                    borderBottom: "1px solid #ebeecf",
                    position: "sticky",
                    top: "63px",
                    zIndex: 9
                }}
            >

                {/* Filters */}
                <div className="card-body">
                    {!projects || projects.length === 0 ? (
                        <div className="row gy-3 gx-3 align-items-end">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="col-md-2">
                                    <div
                                        className="shimmer"
                                        style={{
                                            width: "100%",
                                            height: "38px",
                                            borderRadius: "4px",
                                        }}
                                    ></div>
                                </div>
                            ))}
                            <div className="col-md-1">
                                <div
                                    className="shimmer"
                                    style={{
                                        width: "100%",
                                        height: "38px",
                                        borderRadius: "4px",
                                    }}
                                ></div>
                            </div>
                        </div>
                    ) : !projects || projects.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
                            No data available
                        </div>
                    ) : (
                        <div className="row gy-3 gx-3 align-items-end">
                            {/* PROJECT */}
                            <div className="col-md-3">
                                <select
                                    id="projectSelect"
                                    className="form-control"
                                    value={selectedProject}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                >
                                    <option>Select Project</option>
                                    {projects?.map((project) => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* <div className="col-md-2">
                                <div className="date-input-wrapper">
                                    <input
                                        id="startDate"
                                        type="date"
                                        className={`form-control ${!filter.startDate ? 'no-value' : ''}`}
                                        value={filter.startDate || ""}
                                        onChange={(e) =>
                                            setFilter((prev) => ({ ...prev, startDate: e.target.value }))
                                        }
                                    />
                                    {!filter.startDate && (
                                        <span className="date-placeholder">Start date</span>
                                    )}
                                </div>
                            </div>

                            {/* Date filter */}
                            <div className="col-md-2">
                                <div className="date-input-wrapper">
                                    <input
                                        id="selectedDate"
                                        type="date"
                                        className={`form-control ${!selectedDate ? 'no-value' : ''}`}
                                        value={selectedDate || ""}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                    {/* {!selectedDate && (
                                        <span className="date-placeholder">dd/mm/yyyy</span>
                                    )} */}
                                </div>
                            </div>

                            {/* Platform */}
                            <div className="col-md-2" ref={dropdownRef} style={{ position: "relative" }}>
                                <div className="d-flex align-items-center">
                                    <div
                                        className="btn w-100 form-select"
                                        style={{ height: "38px", textAlign: "left" }}
                                        onClick={() => setOpen((prev) => !prev)}
                                    >
                                        {selectedPlatforms.length === 0
                                            ? "Platform"
                                            : selectedPlatforms.length === 1
                                                ? LLM_NAME_MAP[selectedPlatforms[0].toLowerCase()] || selectedPlatforms[0]
                                                : `${LLM_NAME_MAP[selectedPlatforms[0].toLowerCase()] || selectedPlatforms[0]} +${selectedPlatforms.length - 1}`}
                                    </div>
                                </div>
                                {open && (
                                    <div
                                        className="card shadow-sm"
                                        style={{ position: "absolute", top: "45px", width: "100%", zIndex: 10, padding: "10px" }}
                                    >
                                        {platforms.map((platform) => {
                                            return (
                                                <div key={platform} className="form-check mb-2 ms-2">
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            value={platform}
                                                            id={`platform-${platform}`}
                                                            checked={selectedPlatforms.includes(platform)}
                                                            onChange={() => togglePlatform(platform)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`platform-${platform}`}>
                                                            {/* {platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()} */}
                                                            {LLM_NAME_MAP[platform.toLowerCase()]}
                                                        </label>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Reset */}
                            <div className="col-md-1 d-flex align-items-center">
                                <button
                                    id="reset"
                                    type="button"
                                    className="btn btn-outline-secondary form-control"
                                    onClick={() => {
                                        setSelectedDate("")
                                        setSelectedPlatforms("")
                                    }
                                    }
                                    style={{ height: "38px", fontSize: "14px", fontWeight: "500" }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div >

            {/* tabs*/}
            < div className="default-cont" >
                {loading || !tabs || tabs.length === 0 ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "8px",
                            padding: "6px",
                            background: "#fff",
                            borderRadius: "5px",
                            marginBottom: "20px",
                        }}
                    >
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="shimmer"
                                style={{
                                    width: "80px",
                                    height: "30px",
                                    borderRadius: "5px",
                                }}
                            ></div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="flex space-x-3 mt-3"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "fit-content",
                            padding: "6px",
                            background: "#fff",
                            borderRadius: "5px",
                            marginBottom: "20px",
                        }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: activeTab === tab ? "#487fff" : "#f1f1f100", // blue for active, grey for inactive
                                    color: activeTab === tab ? "#fff" : "#374151", // white for active, dark grey for inactive
                                    fontFamily: "revert-layer",
                                    padding: "5px 15px",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease-in-out",
                                    borderRadius: "5px",
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )
                }
            </div >

            {activeTab === "General" && (
                <>
                    <div className="default-cont" style={{ marginBottom: '20px' }}>
                        <div className="border  overflow-hidden" style={{ borderRadius: "15px" }}>
                            {/* Headers */}
                            <div className="row g-0 border-bottom fw-500 bg-light">
                                <div className="col-md-4 border-end" style={{ padding: "8px", color: "#1c2024", fontWeight: "500" }} >
                                    Brand Presence
                                </div>
                                <div className="col-md-5 border-end" style={{ padding: "8px", color: "#1c2024", fontWeight: "500" }}>
                                    Citations
                                </div>
                                <div className="col-md-3" style={{ padding: "8px", color: "#1c2024", fontWeight: "500" }}>
                                    Competitor Analysis
                                </div>
                            </div>

                            <div className="row g-0 border-bottom bg-white" style={{ color: "#102024" }}>
                                {loading ?
                                    (
                                        <div className="row g-0 border-bottom bg-white">
                                            {/* Brand Presence */}
                                            <div className="col-md-4 border-end p-3">
                                                <div className="row">
                                                    <div className="col-md-12 mb-3">
                                                        <div className="shimmer" style={{ width: "100px", height: "16px", marginBottom: "6px" }}></div>
                                                        <div className="shimmer" style={{ width: "60px", height: "24px" }}></div>
                                                    </div>
                                                    <div className="col-md-12 mt-2">
                                                        <div className="shimmer" style={{ width: "140px", height: "16px", marginBottom: "6px" }}></div>
                                                        <div className="shimmer" style={{ width: "60px", height: "24px" }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Citations */}
                                            <div className="col-md-5 border-end p-3">
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="shimmer" style={{ width: "120px", height: "16px", marginBottom: "6px" }}></div>
                                                        <div className="shimmer" style={{ width: "60px", height: "24px" }}></div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="shimmer" style={{ width: "120px", height: "16px", marginBottom: "6px" }}></div>
                                                        <div className="shimmer" style={{ width: "60px", height: "24px" }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Competitor Analysis */}
                                            <div className="col-md-3 p-3">
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="shimmer" style={{ width: "80px", height: "16px", marginBottom: "6px" }}></div>
                                                        <div className="shimmer" style={{ width: "60px", height: "24px" }}></div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="shimmer" style={{ width: "80px", height: "16px", marginBottom: "6px" }}></div>
                                                        <div className="shimmer" style={{ width: "60px", height: "24px" }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row g-0 border-bottom bg-white" style={{ color: "#102024" }}>
                                            {/* Brand Presence */}
                                            <div className="col-md-4 border-end p-3">
                                                <div className="row">
                                                    <div className="col-md-12 mb-3">
                                                        <span className="d-block">AI Visibility
                                                            < TooltipIcon title={"The percentage of prompts where the brand was mentioned in AI-generated answers. Higher is better."} />
                                                        </span>

                                                        <div className="d-flex align-items-center">
                                                            {(() => {
                                                                const percentage = promptRanking?.total
                                                                    ? ((totalBrandVisibility / promptRanking.total) * 100).toFixed(2)
                                                                    : 0;

                                                                const {
                                                                    radius,
                                                                    circumference,
                                                                    offset,
                                                                    strokeWidth,
                                                                    backgroundColor,
                                                                    progressColor,
                                                                } = getCircleConfig(percentage);

                                                                return (
                                                                    <>
                                                                        {/* <div className="d-flex gap-2">
                                                                            <span>
                                                                                <svg
                                                                                    style={{ transform: "rotate(-90deg)" }}
                                                                                    width="28"
                                                                                    height="28"
                                                                                    viewBox="0 0 40 40"
                                                                                >
                                                                                    <circle
                                                                                        cx="20"
                                                                                        cy="20"
                                                                                        r={radius}
                                                                                        fill="none"
                                                                                        stroke={backgroundColor}
                                                                                        strokeWidth={strokeWidth}
                                                                                    />

                                                                                    <circle
                                                                                        cx="20"
                                                                                        cy="20"
                                                                                        r={radius}
                                                                                        fill="none"
                                                                                        stroke={progressColor}
                                                                                        strokeWidth={strokeWidth}
                                                                                        strokeDasharray={circumference}
                                                                                        strokeDashoffset={offset}
                                                                                        strokeLinecap="round"
                                                                                        style={{ transition: "stroke-dashoffset 0.4s ease-in-out" }}
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </div> */}

                                                                        <span
                                                                            className="d-block text-black me-3"
                                                                            style={{ fontSize: "20px", fontWeight: "600" }}
                                                                        >
                                                                            {percentage}%
                                                                        </span>

                                                                    </>
                                                                );
                                                            })()}
                                                        </div>


                                                    </div>

                                                    <div className="col-md-12 mt-2">
                                                        <span className="d-block ">
                                                            <span>
                                                                Answers mentioning me
                                                                < TooltipIcon title={"Number of prompt answers from different AI models that mention your brand"} />

                                                            </span>
                                                        </span>
                                                        <div className="d-flex align-items-center">
                                                            <span className="d-block text-primary me-3" style={{ fontSize: "20px", fontWeight: "600" }}>
                                                                <Link className="d-block text-primary me-3"
                                                                    to={`/llm-dashboard/${selectedProject}/${selectedProjectDomain}/${selectedProjectBrand}?date=${selectedDate}`}
                                                                    style={{ fontSize: "20px", fontWeight: "600", cursor: "pointer" }}>
                                                                    {totalBrandVisibility != null ? totalBrandVisibility.toString() : "0"}
                                                                </Link>
                                                            </span>
                                                            {/* <span className="d-block text-success" style={{ fontSize: "12px", fontWeight: "400" }}>
                                                    {totalBrandVisibility != null ? totalBrandVisibility.toString() : "0"}
                                                </span> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Citations */}
                                            <div className="col-md-5 border-end p-3"
                                            >
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <span className="d-block "
                                                        >
                                                            <span
                                                            >
                                                                Total pages cited
                                                                < TooltipIcon title={"Total number of unique web pages that AI platforms cite as sources across all answers. This includes pages from your website, competitors, and other third-party sources."} />

                                                            </span>
                                                        </span>
                                                        <div className="d-flex align-items-center">
                                                            <Link className="d-block text-primary me-3"
                                                                to={`/llm-dashboard/${selectedProject}?date=${selectedDate}`}
                                                                style={{ fontSize: "20px", fontWeight: "600", cursor: "pointer" }}>{totalPagesCited || 0}
                                                            </Link>
                                                            {/* <span className="d-block text-success" style={{ fontSize: "12px", fontWeight: "400" }}>1395</span> */}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <span className="d-block ">
                                                            <span>
                                                                My pages cited
                                                                < TooltipIcon title={"Pages from your website that AI models cite as sources in their answers."} />
                                                            </span>                                            </span>
                                                        <div className="d-flex align-items-center">
                                                            <Link className="d-block text-primary me-3"
                                                                to={`/llm-dashboard/${selectedProject}/${selectedProjectDomain}?date=${selectedDate}`}
                                                                style={{ fontSize: "20px", fontWeight: "600", cursor: "pointer" }}>{myPagesCited || 0}
                                                            </Link>
                                                            {/* <span className="d-block text-primary me-3" style={{ fontSize: "20px", fontWeight: "600" }}>{myCitedPage || 0}</span> */}
                                                            {/* <span className="d-block text-success" style={{ fontSize: "12px", fontWeight: "400" }}>{myCitedPage}</span> */}
                                                        </div>
                                                    </div>
                                                    {myPagesCount > 0 && (
                                                        <div className="col-md-12 mb-3">
                                                            <span className="d-block ">
                                                                <span >
                                                                    Pages mentioning me
                                                                    < TooltipIcon title={"External websites cited by AI Models that mention your brand, includes competitor and third-party pages."} />

                                                                </span>

                                                            </span>
                                                            <div className="d-flex align-items-center"
                                                            >
                                                                <Link className="d-block text-primary me-3"
                                                                    to={`/llm-dashboard/${selectedProject}/ThirdPartyPages?date=${selectedDate}`}
                                                                    style={{ fontSize: "20px", fontWeight: "600", cursor: "pointer" }}>{myPagesCount}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Competitor Analysis*/}
                                            <div className="col-md-3 p-3">
                                                <div className="row ">
                                                    <div className="col-md-6 mb-3">
                                                        <span className="d-block">
                                                            <span>
                                                                Your Share
                                                                < TooltipIcon title={"Shows your brand’s visibility when compared to your competitors."} />
                                                            </span>
                                                        </span>
                                                        <div className="d-flex align-items-center">
                                                            <span
                                                                onClick={() => setActiveTab("Competitors")}
                                                                className="d-block text-primary me-3" style={{ fontSize: "20px", fontWeight: "600", cursor: "pointer" }}>{myCompetitorShare}</span>
                                                            {/* <span className="d-block text-success" style={{ fontSize: "12px", fontWeight: "400" }}>{myCompetitorShare}</span> */}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <span>
                                                            Your Position
                                                            < TooltipIcon title={"Shows your brand’s visibility position when compared to your competitors."} />
                                                        </span>
                                                        <span
                                                            onClick={() => setActiveTab("Competitors")}
                                                            className="d-block text-primary" style={{ fontSize: "20px", fontWeight: "600", cursor: "pointer" }}>{myCompetitorPosition}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                            </div>
                        </div>
                    </div >

                    <div className="default-cont">
                        <section className="row gy-2 ">
                            {/* Visibility trends over time chart */}
                            <div className="col-md-7">
                                {loading || !competitorPercentages || Object.keys(competitorPercentages).length === 0 ? (
                                    <div
                                        className="shimmer"
                                        style={{
                                            width: "100%",
                                            height: "300px", // match your chart's approximate height
                                            borderRadius: "8px",
                                            background: "#f0f0f0",
                                        }}
                                    ></div>
                                ) : (
                                    <SalesStatisticOne
                                        aggregatedVisibility={competitorPercentages}
                                        interval={interval}
                                        onIntervalChange={(val) => setInterval(val)}
                                        title="Visibility trends over time"
                                    />
                                )}
                            </div>

                            {/* AI visibility leaderboard table */}
                            <div className="col-md-5">
                                {loading || !industryData || industryData.length === 0 ? (
                                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                                        <table className="table table-sm mb-0 ir-table bordered-table">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Brand</th>
                                                    <th>Visibility</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.from({ length: 4 }).map((_, i) => (
                                                    <tr key={i}>
                                                        {/* Brand column */}
                                                        <td style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 200 }}>
                                                            <div
                                                                className="shimmer"
                                                                style={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: "50%",
                                                                    flexShrink: 0,
                                                                    border: "1px solid #ddd",
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="shimmer"
                                                                style={{ width: "120px", height: 16, borderRadius: "4px" }}
                                                            ></div>
                                                        </td>

                                                        {/* Visibility column */}
                                                        <td>
                                                            <div
                                                                className="shimmer"
                                                                style={{ width: "60px", height: 16, borderRadius: "4px" }}
                                                            ></div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <IndustryRanking data={industryData} totalPrompt={promptRanking.total} />
                                )}
                            </div>

                            {/* Platform wise brand visibility */}
                            <div className="col-md-12 m-0">
                                {loading || !brandVisibility || brandVisibility.length === 0 ? (
                                    <div className="d-flex flex-column mt-20">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="shimmer"
                                                style={{
                                                    width: "100%",
                                                    height: "80px", // adjust to approximate row height
                                                    borderRadius: "6px",
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                ) : (
                                    <PlatformVisibility
                                        data={brandVisibility}
                                        mentions={llmResults}
                                        setActiveTab={setActiveTab}
                                    />
                                )}
                            </div>

                            {/* Which rank is your brand mentioned in answers? */}
                            <div className="col-md-7">
                                {loading ? (
                                    <div className="d-flex flex-column gap-3">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="shimmer"
                                                style={{
                                                    width: "100%",
                                                    height: "50px",
                                                    borderRadius: "8px",
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                ) : (
                                    <RankSummary data={rankSummary}
                                        selectedDate={selectedDate}
                                        selectedProject={selectedProject}
                                        selectedProjectDomain={selectedProjectDomain}
                                        selectedProjectBrand={selectedProjectBrand} />
                                )}
                            </div>

                            <div className="col-md-5">
                                <MarketShare data={industryData} totalPrompt={promptRanking.total}
                                    setActiveTab={setActiveTab}
                                />
                            </div>
                            <div className="col-md-12">
                                <UrlRanking data={topUrlData} selectedProjectDomain={selectedProjectDomain} selectedProject={selectedProject} selectedDate={selectedDate} />
                            </div>

                            <div className="col-md-12">
                                <TopKeywords data={topKeywordsData} />
                            </div>
                            {/* <div className="col-md-12">
                            <YourMentionsChatgpt projectId={selectedProject} data={chatgptData} />
                        </div>
                        <div className="col-md-12">
                            <YourMentionsPerplexity projectId={selectedProject} data={perplexityData} />
                        </div>
                        <div className="col-md-12">
                            <YourMentionsGemini projectId={selectedProject} data={geminiData} />
                        </div>
                        <div className="col-md-12">
                            <YourMentionsClaude projectId={selectedProject} data={claudeData} />
                        </div> */}

                        </section>
                    </div>

                    {/* <div className="col-md-12 mt-20">
                        <Citations projectId={selectedProject} data={citationsData} />
                    </div> */}
                </>
            )
            }

            {
                activeTab === "Platforms" && brandVisibility.length > 0 && (
                    <PlatformTabComponent data={brandVisibility} mentions={llmResults} chartData={llmTimelineData} />
                )
            }

            {
                activeTab === "Competitors" && industryData.length > 0 && (
                    <CompetitorsTabComponent data={industryData} totalPrompt={promptRanking.total} />
                )
            }

        </>

    );
};

export default WriteSonicDashboard;
