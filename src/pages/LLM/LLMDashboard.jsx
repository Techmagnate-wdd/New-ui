import { useEffect, useState } from "react";
import Citations from "./Citations";
import IndustryRanking from "./IndustryRanking";
import ModalPerformance from "./ModalPerformance";
import SalesStatisticOne from "./SalesStatisticOne";
import YourMentionsChatgpt from "./YourMentionsChatgpt";
import YourMentionsClaude from "./YourMentionsClaude";
import YourMentionsGemini from "./YourMentionsGemini";
import YourMentionsPerplexity from "./YourMentionsPerplexity";
import { downloadExcel, getCitations, getLLMProjects, llmProjects } from "../../services/api";
import { Icon } from "@iconify/react";
import { Tooltip } from 'react-tooltip';

const LLMDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("68cba546eaf7e55efe1a6fef");
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

    // Fetch all LLM projects
    const fetchProjects = async () => {
        try {
            let filter = {}
            const res = await getLLMProjects(filter = {}, "all");
            if (res.data && Array.isArray(res.data.projects)) {
                setProjects(res.data.projects);
                if (res.data.projects.length > 0) {
                    setSelectedProject(res.data.projects[0]._id);
                }
            }
        } catch (err) {
            console.error("Error fetching LLM projects:", err);
        }
    };

    // Fetch citations for selected project
    const fetchCitations = async (projectId, intervalParam = interval) => {
        if (!projectId) return;
        try {
            const response = await getCitations({ projectId, interval: intervalParam });
            setChatgptData(response.data.data.llmResults.llm_chatgpt)
            setPerplexityData(response.data.data.llmResults.llm_perplexity)
            setGeminiData(response.data.data.llmResults.llm_gemini)
            setClaudeData(response.data.data.llmResults.llm_claude)
            setCitationsData(response.data.data);
            setVisibilityData(response.data.data.visibilityTimeline || {});
            setIndustryData(response.data.data.topCompetitors || {});
        } catch (err) {
            console.error("Error fetching citations:", err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch citations whenever selectedProject changes
    useEffect(() => {
        if (selectedProject) {
            fetchCitations(selectedProject);
        }
    }, [selectedProject, interval]);

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

    return (
        <>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row gy-3 gx-3 align-items-end">
                        {/* PROJECT */}
                        <div className="col-md-3">
                            <label htmlFor="projectSelect" className="form-label fw-semibold">
                                Project
                            </label>
                            <select
                                id="projectSelect"
                                className="form-control"
                                value={selectedProject}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedProject(val);
                                }}
                            >
                                <option value="">Select Project</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Export Button */}
                        <div className="col-md-1 align-items-end pt-6">
                            <button
                                style={{
                                    background: exportLoading ? "#bdc3c7" : "#487fff",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "5px",
                                    cursor: exportLoading ? "not-allowed" : "pointer",
                                    opacity: exportLoading ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                }}
                                disabled={exportLoading}
                                onClick={exportData}
                            >
                                {exportLoading ? (
                                    <>
                                        <span
                                            style={{
                                                fontWeight: "600px",
                                                border: "2px solid #f3f3f3",
                                                borderTop: "2px solid #2980b9",
                                                borderRadius: "50%",
                                                width: "14px",
                                                height: "14px",
                                                animation: "spin 1s linear infinite",
                                            }}
                                        />
                                        Exporting...
                                    </>
                                ) : (
                                    "Export"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4 pt-12">
                {/* Prompt Rankings */}
                <div className="col">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
                        <div className="card-body p-20 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                                    <span>Prompt Rankings</span>
                                    <span
                                        data-tooltip-id="ranking-tooltip"
                                        className="text-muted cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        aria-label="More info about prompt rankings"
                                        style={{ lineHeight: "0" }}
                                    >
                                        <Icon icon="fa6-solid:circle-question" className="text-muted" />
                                    </span>
                                </p>

                                <h4 className="mb-0 fw-bold text-success">
                                    {promptRanking.ranked}/{promptRanking.total}
                                </h4>
                            </div>
                            <div className="w-50-px h-50-px bg-success-subtle rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="fa6-solid:chart-line" className="text-success text-2xl" />
                            </div>
                        </div>
                    </div>
                    {/* Tooltip - matches data-tooltip-id above */}
                    <Tooltip
                        id="ranking-tooltip"
                        place="top"
                        content="This shows your ranking out of total prompts"
                        delayShow={150}
                    />
                </div>

                {/* Total Mentions */}
                <div className="col">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
                        <div className="card-body p-20 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                                    <span>Total Mentions</span>
                                    <span
                                        data-tooltip-id="mentions-tooltip"
                                        className="text-muted cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        aria-label="More info about prompt rankings"
                                        style={{ lineHeight: "0" }}
                                    >
                                        <Icon icon="fa6-solid:circle-question" className="text-muted" />
                                    </span>
                                </p>
                                <h4 className="mb-0 fw-bold text-primary">{totalDomainMatches}</h4>
                            </div>
                            <div className="w-50-px h-50-px bg-primary-subtle rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="fa6-solid:link" className="text-primary text-2xl" />
                            </div>
                        </div>
                    </div>
                    <Tooltip
                        id="mentions-tooltip"
                        place="top"
                        content="This shows your total mentions"
                        delayShow={150}
                    />
                </div>

                {/* Third Card Placeholder */}
                <div className="col">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
                        <div className="card-body p-20 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                                    <span>Avg. Rank</span>
                                    <span
                                        data-tooltip-id="position-tooltip"
                                        className="text-muted cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        aria-label="More info about prompt rankings"
                                        style={{ lineHeight: "0" }}
                                    >
                                        <Icon icon="fa6-solid:circle-question" className="text-muted" />
                                    </span>
                                </p>
                                <h4 className="mb-0 fw-bold text-secondary">{averagePosition}</h4>
                            </div>
                            <div className="w-50-px h-50-px bg-secondary-subtle rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="fa6-solid:ellipsis" className="text-secondary text-2xl" />
                            </div>
                        </div>
                    </div>
                    <Tooltip
                        id="position-tooltip"
                        place="top"
                        content="This shows average ranking out of total answers"
                        delayShow={150}
                    />
                </div>

                {/* Third Card Placeholder */}
                {/* <div className="col">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
                        <div className="card-body p-20 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                                    <span>Brand Visibility</span>
                                    <span
                                        data-tooltip-id="position-tooltip"
                                        className="text-muted cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        aria-label="More info about prompt rankings"
                                        style={{ lineHeight: "0" }}
                                    >
                                        <Icon icon="fa6-solid:circle-question" className="text-muted" />
                                    </span>
                                </p>
                                <h4 className="mb-0 fw-bold text-secondary">{averagePosition}</h4>
                            </div>
                            <div className="w-50-px h-50-px bg-secondary-subtle rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="fa6-solid:ellipsis" className="text-secondary text-2xl" />
                            </div>
                        </div>
                    </div>
                    <Tooltip
                        id="position-tooltip"
                        place="top"
                        content="This shows average ranking out of total answers"
                        delayShow={150}
                    />
                </div> */}
            </div>


            {/* All Tables */}
            <section className="row gy-4 mt-1">
                <div className="col-md-6">
                    <SalesStatisticOne
                        visibilityData={visibilityData}
                        interval={interval}
                        onIntervalChange={(val) => setInterval(val)}
                    />
                </div>
                <div className="col-md-6">
                    <IndustryRanking data={industryData} />
                </div>
                <div className="col-md-12">
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
                </div>
                {/* <div className="col-md-6">
          <ModalPerformance />
        </div> */}
            </section>

            <div className="col-md-12 mt-20">
                <Citations projectId={selectedProject} data={citationsData} />
            </div>
        </>
    );
};

export default LLMDashboard;
