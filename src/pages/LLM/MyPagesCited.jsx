import React, { useEffect, useState, useRef, useContext } from "react";
import { getLLMProjects, getLLMPromptsWithUrls } from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import TooltipIcon from "./ToolTipIcon";
import AuthContext from "../../context/AuthContext";

const PLATFORMS = ["ChatGPT", "Perplexity", "Gemini", "Claude"];
const PAGE_SIZE = 10;
const EXPORT_BATCH_SIZE = 5000;

// Download icon component
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
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

const LLM_NAME_MAP = {
    chatgpt: "ChatGPT",
    ai_overview: "AI Mode",
    aiMode: "AI Mode",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude"
};


const MyPagesCited = () => {
    // Data states
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRows, setTotalRows] = useState(0);

    // Filter states
    const [searchPrompt, setSearchPrompt] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [selectedCompetitors, setSelectedCompetitors] = useState([]);
    const [availableCompetitors, setAvailableCompetitors] = useState([]);
    const [competitorMap, setCompetitorMap] = useState({}); // Map of domain -> brand name

    // Dropdown states
    const [openPlatform, setOpenPlatform] = useState(false);
    const [openCompetitor, setOpenCompetitor] = useState(false);
    const [open, setOpen] = useState(false)

    // Refs
    const platformDropdownRef = useRef(null);
    const competitorDropdownRef = useRef(null);

    // Route states
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const transferredDate = queryParams.get("date");
    const navigate = useNavigate();

    const [projectId, setProjectId] = useState(null);
    const [urlSelectedCompetitor, setUrlSelectedCompetitor] = useState(null);
    const [projects, setProjects] = useState([])
    const [platforms, setPlatforms] = useState([])
    const [selectedDate, setSelectedDate] = useState("");
    const { user } = useContext(AuthContext)
    const userId = user?._id

    // Extract available competitors from API response (fixedCompetitors)
    const extractCompetitorsFromResponse = (response) => {
        const fixedCompetitors = response?.data?.filters?.project.competitors || [];
        const myProject = response?.data?.filters?.project || [];

        let myProjectData = { "brand": myProject.name.toLowerCase(), "domain": myProject.target }

        let allCompetitors = [...fixedCompetitors, myProjectData]

        // Create a map of domain -> brand name for display
        const map = {};
        allCompetitors.forEach(comp => {
            map[comp.domain] = comp.brand;
        });
        setCompetitorMap(map);

        // Return sorted array of domains
        return allCompetitors.map(comp => comp.domain).sort();
    };

    useEffect(() => {
        if (platforms.length > 0) {
            setSelectedPlatforms(platforms);
        }
    }, [platforms]);


    // Fetch citations with pagination and filters
    const fetchCitations = async (projectId, page = 1) => {
        if (!projectId) return;

        setLoading(true);
        try {
            const filters = {
                projectId,
                platforms: selectedPlatforms.length > 0 ? selectedPlatforms : [],
                competitors: selectedCompetitors.length > 0 ? selectedCompetitors : [],
                selectedDate: selectedDate || transferredDate
            };

            const response = await getLLMPromptsWithUrls({
                filters,
                page,
                limit: PAGE_SIZE
            });

            if (response?.data?.data) {
                const { rows = [], pagination = {} } = response.data.data;

                setData(rows);
                setTotalPages(pagination.totalPages || 0);
                setTotalRows(pagination.totalRows || 0);

                // Extract and set available competitors from API response
                const competitors = extractCompetitorsFromResponse(response.data);
                setAvailableCompetitors(competitors);
            }
        } catch (err) {
            console.error("Error fetching citations:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initialize from URL - extract project ID and selected competitor
    useEffect(() => {
        const pathParts = location.pathname.split("/").filter(Boolean);

        if (pathParts.length >= 2) {
            const idFromUrl = pathParts[pathParts.length - 2];
            const competitorFromUrl = pathParts[pathParts.length - 1];

            setProjectId(idFromUrl);
            setUrlSelectedCompetitor(competitorFromUrl);
            setSelectedCompetitors([competitorFromUrl]);
        }
    }, [location.pathname]);

    // Fetch data when dependencies change
    useEffect(() => {
        if (projectId) {
            fetchCitations(projectId, currentPage);
        }
    }, [projectId, currentPage, selectedPlatforms, selectedCompetitors, selectedDate]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (platformDropdownRef.current && !platformDropdownRef.current.contains(event.target)) {
                setOpenPlatform(false);
            }
            if (competitorDropdownRef.current && !competitorDropdownRef.current.contains(event.target)) {
                setOpenCompetitor(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle platform selection
    const togglePlatform = (platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
        setCurrentPage(1);
        setTimeout(() => {
            setOpenPlatform(false)
        }, [100])
    };

    // Select competitor (single selection only)
    const selectCompetitor = (competitor) => {
        setSelectedCompetitors([competitor]);
        setCurrentPage(1);
        setOpenCompetitor(false); // Close dropdown after selection
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedPlatforms([]);
        setSelectedCompetitors(urlSelectedCompetitor ? [urlSelectedCompetitor] : []);
        setSearchPrompt("");
        setSelectedDate("")
        setCurrentPage(1);
    };

    // Filter data by search prompt (client-side)
    const filteredData = data.filter(row => {
        if (!searchPrompt.trim()) return true;
        return row.prompt?.toLowerCase().includes(searchPrompt.toLowerCase());
    });

    // Export function with batch processing
    const handleExport = async () => {
        if (!projectId) {
            alert('No project selected');
            return;
        }

        setExportLoading(true);
        try {
            const filters = {
                projectId,
                platforms: selectedPlatforms.length > 0 ? selectedPlatforms : [],
                competitors: selectedCompetitors.length > 0 ? selectedCompetitors : [],
                selectedDate: selectedDate || transferredDate
            };

            const totalBatches = Math.ceil(totalRows / EXPORT_BATCH_SIZE);
            let allData = [];

            // Fetch all data in batches
            for (let i = 0; i < totalBatches; i++) {
                const response = await getLLMPromptsWithUrls({
                    filters,
                    page: i + 1,
                    limit: EXPORT_BATCH_SIZE
                });

                if (response?.data?.data?.rows) {
                    allData = [...allData, ...response.data.data.rows];
                }

                if (totalBatches > 1) {
                    console.log(`Fetching batch ${i + 1} of ${totalBatches}...`);
                }
            }

            // Apply search filter to export data
            if (searchPrompt.trim()) {
                allData = allData.filter(row =>
                    row.prompt?.toLowerCase().includes(searchPrompt.toLowerCase())
                );
            }

            if (allData.length === 0) {
                alert('No data to export');
                return;
            }

            // Create worksheet
            const worksheetData = [
                ['Prompt', 'URL', 'Domain', 'Platform', 'Date'],
                ...allData.map(row => [
                    row.prompt || '',
                    row.url || '',
                    row.domain || '',
                    LLM_NAME_MAP[row.platform] || '',
                    row.date ? new Date(row.date).toLocaleDateString() : ''
                ])
            ];

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Set column widths
            worksheet['!cols'] = [
                { wch: 60 },
                { wch: 80 },
                { wch: 30 },
                { wch: 15 },
                { wch: 15 }
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Citations');
            const filename = `citations_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, filename);

        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        } finally {
            setExportLoading(false);
        }
    };

    // Pagination handlers
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageClick = (pageNum) => {
        setCurrentPage(pageNum);
    };

    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Check if any filters are active
    const hasActiveFilters = () => {
        return (
            selectedPlatforms.length > 0 ||
            selectedCompetitors.length > (urlSelectedCompetitor === selectedCompetitors[0] ? 1 : 0) ||
            searchPrompt.trim() !== "" || selectedDate
        );
    };

    const fetchProjects = async () => {
        try {
            const res = await getLLMProjects({}, userId);

            if (res.data && Array.isArray(res.data.projects)) {
                setProjects(res.data.projects);
            }
        } catch (err) {
            console.error("Error fetching LLM projects:", err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchProjects();
    }, []);

    // Set default platform on first load
    useEffect(() => {
        if (projects.length > 0 && projectId) {
            const firstProject = projects.find((item) => item._id === projectId);
            setPlatforms(
                firstProject.type || []
            );
        }
    }, [projects, projectId]);

    return (
        <div>
            {/* Filters Section */}
            <div
                className="card1 shadow-sm mb-4"
                style={{
                    padding: "13px",
                    background: "#fff",
                    borderTop: "1px solid #ebeecf",
                    borderBottom: "1px solid #ebeecf",
                    position: "sticky",
                    top: "63px",
                    zIndex: 9
                }}
            >
                <div className="card-body">
                    <div className="row gy-3 gx-3 align-items-end">
                        {loading ? (
                            <>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="col-md-2">
                                        <div className="shimmer" style={{ height: "38px", borderRadius: "6px" }}></div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {/* Search Prompt */}
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search prompts..."
                                        value={searchPrompt}
                                        onChange={(e) => setSearchPrompt(e.target.value)}
                                        style={{ height: '38px' }}
                                    />
                                </div>

                                {/* Platform Filter */}
                                <div className="col-md-2" ref={platformDropdownRef} style={{ position: "relative" }}>
                                    <button
                                        className="btn btn-outline-secondary w-100 form-select"
                                        style={{ height: "38px", textAlign: "left" }}
                                        onClick={() => setOpenPlatform(prev => !prev)}
                                    >
                                        {/* {selectedPlatforms.length
                                            ? `Platform (${selectedPlatforms.length})`
                                            : "Platform"} */}
                                        {selectedPlatforms.length === 0
                                            ? "Platform"
                                            : selectedPlatforms.length === 1
                                                ? LLM_NAME_MAP[selectedPlatforms[0]]
                                                : `${LLM_NAME_MAP[selectedPlatforms[0]]} +${selectedPlatforms.length - 1}`}

                                    </button>
                                    {openPlatform && (
                                        <div
                                            className="card shadow-sm"
                                            style={{
                                                position: "absolute",
                                                top: "45px",
                                                width: "100%",
                                                zIndex: 10,
                                                padding: "10px",
                                                maxHeight: "300px",
                                                overflowY: "auto"
                                            }}
                                            onClick={() => setOpenPlatform((prev) => !prev)}
                                        >
                                            {
                                                platforms.map((platform) => (
                                                    <div key={platform} className="form-check mb-2 d-flex">
                                                        <div className="d-flex gap-2 align-items-center">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                value={platform}
                                                                id={`platform-${platform}`}
                                                                checked={selectedPlatforms.includes(platform)}
                                                                onChange={() => togglePlatform(platform)}
                                                            />
                                                        </div>
                                                        <label className="form-check-label" htmlFor={`platform-${platform}`}>
                                                            {LLM_NAME_MAP[platform]}
                                                        </label>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Competitor Filter */}
                                <div className="col-md-2" ref={competitorDropdownRef} style={{ position: "relative" }}>
                                    <button
                                        className="btn btn-outline-secondary w-100 form-select"
                                        style={{ height: "38px", textAlign: "left" }}
                                        onClick={() => setOpenCompetitor(prev => !prev)}
                                    >
                                        {selectedCompetitors.length > 0
                                            ? toTitleCase(competitorMap[selectedCompetitors[0]] || selectedCompetitors[0])
                                            : "Competitor"}
                                    </button>
                                    {openCompetitor && (
                                        <div
                                            className="card shadow-sm"
                                            style={{
                                                position: "absolute",
                                                top: "45px",
                                                width: "100%",
                                                zIndex: 10,
                                                padding: "10px",
                                                maxHeight: "300px",
                                                overflowY: "auto"
                                            }}
                                        >
                                            {availableCompetitors.length > 0 ? (
                                                availableCompetitors.map((competitor) => (
                                                    <div key={competitor} className="form-check mb-2 d-flex">
                                                        <div className="d-flex gap-2 align-items-center">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="competitor"
                                                                value={competitor}
                                                                id={`competitor-${competitor}`}
                                                                checked={selectedCompetitors.includes(competitor)}
                                                                onChange={() => selectCompetitor(competitor)}
                                                            />
                                                        </div>
                                                        <label className="form-check-label" htmlFor={`competitor-${competitor}`}>
                                                            {competitorMap[competitor] || competitor}
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-muted text-center py-2">
                                                    No competitors found
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                            style={{ cursor: "pointer" }}
                                        />
                                        {/* {!selectedDate && (
                                        <span className="date-placeholder">dd/mm/yyyy</span>
                                    )} */}
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                {hasActiveFilters() && (
                                    <div className="col-md-2">
                                        <button
                                            className="btn btn-primary w-100"
                                            style={{ height: "38px" }}
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}

                                {/* Back Button */}
                                <div className="col-md-2 text-end">
                                    <button
                                        className="btn btn-secondary d-flex align-items-center"
                                        onClick={() => {
                                            console.log("Helli")
                                            navigate(-1)
                                        }}
                                    >
                                        <span style={{ fontSize: "12px", marginRight: "8px", marginBottom: "3px" }}>←</span>
                                        <span style={{ fontWeight: 500 }}>Back</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="card h-100">
                <div className="card-body p-24">
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-16">
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div className="shimmer" style={{ width: '200px', height: '24px', borderRadius: '4px' }}></div>
                                <div className="shimmer" style={{ width: '300px', height: '12px', borderRadius: '4px' }}></div>
                            </div>
                        ) : (
                            <>
                                <div style={{ color: "#000", fontWeight: 500, fontSize: "1.5rem" }}>
                                    All citations
                                    <p style={{ fontSize: "12px", color: "#8b8e98" }}>
                                        Explore individual pages from the domain that AI models are citing
                                    </p>
                                </div>
                                <button
                                    style={{
                                        backgroundColor: "#fff",
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid #d1d5db",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        outline: "none",
                                        transition: "all 0.2s",
                                        cursor: exportLoading ? "not-allowed" : "pointer",
                                        opacity: exportLoading ? 0.6 : 1
                                    }}
                                    onClick={handleExport}
                                    disabled={exportLoading}
                                >
                                    {exportLoading ? (
                                        <span style={{ marginRight: "8px" }}>Exporting...</span>
                                    ) : (
                                        <DownloadIcon />
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Table */}
                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                        <table className="table table-sm mb-0 ir-table bordered-table">
                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr className="text-nowrap">
                                    <th scope="col">
                                        <span>
                                            Your Prompts
                                            <TooltipIcon title="The AI-generated query we sent to platforms like ChatGPT, Claude, Perplexity and Gemini." />
                                        </span>
                                    </th>
                                    <th scope="col">
                                        <span>
                                            Cited page
                                            <TooltipIcon title="Webpages that AI models cite as sources in their answers. Includes your domain, competitors, and other third-party sources." />
                                        </span>
                                    </th>
                                    <th scope="col">
                                        <span>
                                            Domain
                                            <TooltipIcon title="Domain that appear in the content of this cited pages. When AI cites these pages, these domain get indirect exposure" />
                                        </span>
                                    </th>
                                    <th scope="col">
                                        <span>
                                            Platform
                                            <TooltipIcon title="Which AI models (ChatGPT, Claude, Gemini, Perplexity etc.) have cited this page in their answers. Different models may prefer different sources." />
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(4)].map((_, j) => (
                                                <td key={j}>
                                                    <div className="shimmer" style={{ height: "16px", borderRadius: "4px" }}></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((row, i) => (
                                        <tr key={`${row.taskId}-${i}`} className="text-nowrap">
                                            <td title={row.prompt} style={{ cursor: "pointer" }}>
                                                {row.prompt
                                                    ? row.prompt.length > 40
                                                        ? row.prompt.substring(0, 40) + "..."
                                                        : row.prompt
                                                    : ""}
                                            </td>
                                            <td title={row.url} style={{ cursor: row.url ? "pointer" : "default" }}>
                                                {row.url ? (
                                                    <a
                                                        href={row.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ textDecoration: "none", color: "#0066cc" }}
                                                    >
                                                        {row.url.length > 30 ? row.url.substring(0, 30) + "..." : row.url}
                                                    </a>
                                                ) : (
                                                    ""
                                                )}
                                            </td>
                                            <td>{row.domain || ""}</td>
                                            <td style={{ textTransform: "capitalize" }}>{LLM_NAME_MAP[row.platform] || ""}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: "1px solid #dee2e6" }}>
                            <div style={{ fontSize: "14px", color: "#6c757d" }}>
                                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalRows)} of {totalRows} results
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{
                                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                        opacity: currentPage === 1 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </button>

                                <div className="d-flex gap-1">
                                    {getPageNumbers().map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageClick(pageNum)}
                                            className={`btn btn-sm ${currentPage === pageNum
                                                ? 'btn-primary'
                                                : 'btn-outline-secondary'
                                                }`}
                                            style={{ minWidth: "40px" }}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{
                                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                        opacity: currentPage === totalPages ? 0.5 : 1
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPagesCited;