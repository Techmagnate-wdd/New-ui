import * as XLSX from 'xlsx';
import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getLLMProjects, getLLMPromptsWithBrand } from "../../services/api";
import TooltipIcon from "./ToolTipIcon";
import AuthContext from '../../context/AuthContext';

const PLATFORMS = ["ChatGPT", "Perplexity", "Gemini", "Claude", "AI Overview"];

const DownloadIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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

const LLM_NAME_MAP = {
    chatgpt: "ChatGPT",
    ai_overview: "AI Mode",
    aiMode: "AI Mode",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude"
};

const BrandCitations = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [availableBrands, setAvailableBrands] = useState([]);
    const pageSize = 10;

    const [searchPrompt, setSearchPrompt] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [targetDomain, setTargetDomain] = useState("");
    const [targetBrand, setTargetBrand] = useState("");
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false)
    const [availableCompetitors, setAvailableCompetitors] = useState([]);
    const [competitorMap, setCompetitorMap] = useState({}); // Map of domain -> brand name
    const [selectedCompetitors, setSelectedCompetitors] = useState("");
    const [platforms, setPlatforms] = useState([])
    const [projects, setProjects] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [openCompetitor, setOpenCompetitor] = useState(false);
    const { user } = useContext(AuthContext);
    const userId = user?._id || "";

    // Get params from URL
    const { id: projectId, myPage, myBrand } = useParams();
    const location = useLocation();


    const queryParams = new URLSearchParams(location.search);
    const transferredDate = queryParams.get("date");
    const rankVisible = queryParams.get("rank");
    console.log(rankVisible, "rankVisible")
    const navigate = useNavigate()

    const platformDropdownRef = useRef(null);
    const brandDropdownRef = useRef(null);
    const [openPlatform, setOpenPlatform] = useState(false);
    const [openBrand, setOpenBrand] = useState(false);

    const extractBrandFromDomain = (domain) => {
        if (!domain) return null;
        const normalized = domain.replace(/^www\./, "").toLowerCase();
        return normalized.split(".")[0];
    };

    const getLogoUrl = (domain) => {
        return (
            `https://logo.clearbit.com/${domain}`
        )
    };

    // Parse URL parameters on mount
    useEffect(() => {
        if (myBrand || myPage) {
            const brand = extractBrandFromDomain(myBrand);
            setTargetDomain(myPage);
            setTargetBrand(myBrand);
        }
    }, [myBrand, myPage]);

    useEffect(() => {
        if (platforms.length > 0) {
            setSelectedPlatforms(platforms);
        }
    }, [platforms]);

    // Fetch citations
    const fetchCitations = async (projectId, page = 1) => {
        if (!projectId) return;
        setLoading(true);

        try {
            const filters = {
                projectId,
                platforms: selectedPlatforms,
                // brands: selectedBrands,
                myPage: targetDomain || undefined,
                competitors: selectedCompetitors.length > 0 ? selectedCompetitors : [],
                selectedDate: selectedDate || transferredDate
            };

            const response = await getLLMPromptsWithBrand({
                filters,
                page,
                limit: pageSize,
            });

            if (response?.data) {
                setData(response.data.data.rows || []);
                setTotalPages(response.data.data.pagination?.totalPages || 0);
                setTotalRows(response.data.data.pagination?.totalRows || 0);
                setAvailableBrands(response.data.data.availableFilters?.brands || []);

                const competitors = extractCompetitorsFromResponse(response.data);
                setAvailableCompetitors(competitors);
            }
        } catch (err) {
            console.error("Error fetching citations:", err);
        } finally {
            setLoading(false);
        }
    };

    const extractCompetitorsFromResponse = (response) => {
        const fixedCompetitors = response?.data?.project.competitors || [];
        const myProject = response?.data?.project || [];

        let myProjectData = { "brand": myProject.brand, "domain": myProject.target }

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
        if (projectId && targetDomain) {
            const delayDebounce = setTimeout(() => {
                fetchCitations(projectId, currentPage);
            }, 100); // wait 500ms after last change

            return () => clearTimeout(delayDebounce); // cleanup previous timer
        }
    }, [projectId, currentPage, selectedPlatforms, selectedCompetitors, selectedBrands, targetDomain, selectedDate]);


    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (platformDropdownRef.current && !platformDropdownRef.current.contains(event.target)) setOpenPlatform(false);
            if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) setOpenBrand(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const togglePlatform = (platform) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        );
        setCurrentPage(1);

        // delay closing (500ms)
        setTimeout(() => {
            setOpen(false);
        }, 100);
    };


    const toggleBrand = (brand) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
        setCurrentPage(1);
    };

    const filteredData = data.filter((row) =>
        searchPrompt.trim() ? row.prompt?.toLowerCase().includes(searchPrompt.toLowerCase()) : true
    );

    const handleExport = async () => {
        if (!projectId || !targetDomain) {
            alert("No project or domain selected");
            return;
        }
        setExportLoading(true);

        try {
            const filters = {
                projectId,
                platforms: selectedPlatforms,
                brands: selectedBrands,
                competitors: selectedCompetitors.length > 0 ? selectedCompetitors : [],
                myPage: targetDomain,
                selectedDate: selectedDate || transferredDate
            };

            const batchSize = 1000;
            const totalBatches = Math.ceil(totalRows / batchSize);
            console.log(`🟨 Total Rows: ${totalRows}, Batch Size: ${batchSize}, Total Batches: ${totalBatches}`);

            let allData = [];

            for (let i = 0; i < totalBatches; i++) {
                console.log(`➡️ Fetching batch ${i + 1}/${totalBatches} ...`);

                try {
                    const response = await getLLMPromptsWithBrand({
                        filters,
                        page: i + 1,
                        limit: batchSize,
                    });

                    // Validate response structure
                    if (!response || !response.data) {
                        console.warn(`⚠️ Empty or invalid response for batch ${i + 1}:`, response);
                        continue;
                    }

                    const result = response.data;
                    console.log(`✅ Batch ${i + 1} response:`, result);

                    if (result?.data?.rows?.length) {
                        allData = [...allData, ...result.data.rows];
                        console.log(`📦 Total accumulated rows: ${allData.length}`);
                    } else {
                        console.warn(`⚠️ No rows found in batch ${i + 1}`);
                    }

                } catch (batchError) {
                    console.error(`❌ Error fetching batch ${i + 1}:`, batchError);
                }
            }

            // Filter by search prompt if applied
            if (searchPrompt?.trim()) {
                console.log("🔍 Filtering results by search prompt...");
                allData = allData.filter((row) =>
                    row.prompt?.toLowerCase().includes(searchPrompt.toLowerCase())
                );
                console.log(`📉 After filter: ${allData.length} rows remain`);
            }

            // Log final dataset size
            console.log("🟩 Final data count:", allData.length);
            console.log("Sample data row:", allData[0]);

            if (!allData.length) {
                alert("No data to export");
                setExportLoading(false);
                return;
            }

            const worksheetData = [
                (rankVisible === "true" || rankVisible === true)
                    ? ["Prompt", "Brands", "Rank", "Platforms", "Date"]
                    : ["Prompt", "Brands", "Platforms", "Date"],

                ...allData.map((row) =>
                    (rankVisible === "true" || rankVisible === true)
                        ? [
                            row.prompt || "",
                            row.brands || "",
                            row.rank || "",
                            LLM_NAME_MAP[row.platform] || "",
                            row.date ? new Date(row.date).toLocaleDateString() : "",
                        ]
                        : [
                            row.prompt || "",
                            row.brands || "",
                            LLM_NAME_MAP[row.platform] || "",
                            row.date ? new Date(row.date).toLocaleDateString() : "",
                        ]
                ),
            ];

            console.log("🧾 Worksheet data prepared. Total rows:", worksheetData.length);

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            worksheet["!cols"] = [
                { wch: 60 },
                { wch: 30 },
                { wch: 20 },
                { wch: 15 },
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, "Citations");

            // ✅ Generate filename
            const normalizedBrand = targetDomain.replace(/^www\./, "").replace(/\./g, "_");
            const filename = `citations_${normalizedBrand}_${new Date()
                .toISOString()
                .split("T")[0]}.xlsx`;

            console.log("💾 Generating Excel file:", filename);

            // ✅ Reliable download method (works across browsers & HTTPS)
            const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([wbout], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            console.log("✅ File successfully created and download triggered.");
            alert(`Successfully exported ${allData.length} rows!`);
        } catch (error) {
            console.error("❌ Error exporting data:", error);
            alert("Failed to export data. Please try again.");
        } finally {
            console.log("🟪 [Export Finished]");
            setExportLoading(false);
        }
    };

    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const handlePageClick = (pageNum) => setCurrentPage(pageNum);

    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) startPage = Math.max(1, endPage - maxPagesToShow + 1);

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
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

    // Toggle competitor selection
    const toggleCompetitor = (competitor) => {
        setSelectedCompetitors(competitor);
        setOpenCompetitor(false); // close dropdown after selecting
        setCurrentPage(1);
    };


    return (
        <div>
            {/* Filters Section */}
            <div className="card1 shadow-sm mb-4"
                style={{
                    padding: "13px",
                    background: "#fff",
                    borderTop: "1px solid #ebeecf",
                    borderBottom: "1px solid #ebeecf",
                    position: "sticky",
                    top: "63px",
                    zIndex: 9
                }}>
                <div className="card-body">
                    <div className="row gy-3 gx-3 align-items-end">
                        {loading ? (
                            <>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="col-md-2">
                                        <div className="shimmer"
                                            style={{
                                                width: "100%",
                                                height: "38px",
                                                borderRadius: "6px"
                                            }}></div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {/* Target Domain Display */}
                                {(rankVisible === true || rankVisible === "true") ? (
                                    // When rankVisible is true
                                    targetDomain && (
                                        <div className="col-md-3">
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 15px',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px'
                                            }}>
                                                <img
                                                    src={getLogoUrl(targetDomain)}
                                                    alt={targetDomain}
                                                    width="20"
                                                    height="20"
                                                    style={{ borderRadius: '4px' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                                                    {targetBrand}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    // When rankVisible is false - Competitor Filter
                                    <div className="col-md-2" style={{ position: "relative" }}>
                                        <button
                                            className="btn btn-outline-secondary w-100 form-control"
                                            style={{ height: "38px", textAlign: "left" }}
                                            onClick={() => setOpenCompetitor((prev) => !prev)}
                                        >
                                            {selectedCompetitors
                                                ? toTitleCase(competitorMap[selectedCompetitors] || selectedCompetitors)
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
                                                        <div key={competitor} className="form-check mb-4 d-flex">
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="competitorRadio"
                                                                    value={competitor}
                                                                    id={`competitor-${competitor}`}
                                                                    checked={selectedCompetitors === competitor}
                                                                    onChange={() => toggleCompetitor(competitor)}
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
                                )}


                                {/* Search Prompt */}
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        placeholder="Search prompts..."
                                        value={searchPrompt}
                                        onChange={(e) => setSearchPrompt(e.target.value)}
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            width: "100%"
                                        }}
                                    />
                                </div>

                                {/* Platform Filter */}
                                <div className="col-md-3" ref={dropdownRef} style={{ position: "relative" }}>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="btn w-100 form-select"
                                            style={{
                                                // height: "38px", textAlign: "left",
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "20px 15px",
                                                border: "1px solid rgb(221, 221, 221)",
                                                borderRadius: "6px"

                                            }}
                                            onClick={() => setOpen((prev) => !prev)}
                                        >
                                            {selectedPlatforms.length === 0
                                                ? "Platform"
                                                : selectedPlatforms.length === 1
                                                    ? LLM_NAME_MAP[selectedPlatforms[0]]
                                                    : `${LLM_NAME_MAP[selectedPlatforms[0]]} +${selectedPlatforms.length - 1}`}
                                        </div>
                                    </div>
                                    {open && (
                                        <div
                                            className="card shadow-sm"
                                            style={{ position: "absolute", top: "45px", width: "100%", zIndex: 10, padding: "10px" }}
                                        >
                                            {platforms.map((platform) => (
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
                                                            {LLM_NAME_MAP[platform]}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Brand Filter */}
                                {/* <div className="col-md-2" ref={brandDropdownRef} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setOpenBrand(!openBrand)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            backgroundColor: '#fff',
                                            textAlign: 'left',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {selectedBrands.length ? `Brand (${selectedBrands.length})` : 'Brand'}
                                    </button>
                                </div> */}

                                {/* Date filter */}
                                <div className="col-md-2">
                                    <div className="date-input-wrapper">
                                        <input
                                            id="selectedDate"
                                            type="date"
                                            className={`form-control ${!selectedDate ? 'no-value' : ''}`}
                                            value={selectedDate || ""}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            style={{
                                                cursor: "pointer",
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                width: "100%",
                                                height: "auto"
                                            }}
                                        />
                                        {/* {!selectedDate && (
                                        <span className="date-placeholder">dd/mm/yyyy</span>
                                    )} */}
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                {(selectedPlatforms.length > 0 || selectedBrands.length > 0 || searchPrompt || selectedDate) && (
                                    <div className="col-md-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPlatforms([]);
                                                setSelectedBrands([]);
                                                setSearchPrompt("");
                                                setSelectedDate("");
                                                setCurrentPage(1);
                                            }}
                                            style={{
                                                padding: '10px',
                                                border: '1px solid #dc3545',
                                                borderRadius: '6px',
                                                backgroundColor: '#fff',
                                                color: '#dc3545',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}

                                {/* Back Button */}
                                <div className="col-md-2 text-end">
                                    <button
                                        className="btn btn-secondary d-flex align-items-center"
                                        onClick={() => navigate(-1)}
                                    >
                                        <span style={{ fontSize: "14px", marginRight: "8px", marginBottom: "3px" }}>←</span>
                                        <span style={{ fontWeight: 500 }}>Back</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>


            {/* Main Card */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <div style={{ margin: 0, color: "#1c2024", fontSize: '22px', fontWeight: 600 }}>
                            All Answers
                        </div>
                        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>
                            View answers across all prompts and platforms
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            backgroundColor: '#fff',
                            cursor: exportLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: exportLoading ? 0.6 : 1
                        }}
                    >
                        {exportLoading ? 'Exporting...' : <DownloadIcon />}
                    </button>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                                    <span>
                                        Prompt
                                        <TooltipIcon title={"The AI-generated query we sent to platforms like ChatGPT, Claude, Perplexity and Gemini."} />
                                    </span>
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                                    <span>
                                        Brands
                                        <TooltipIcon title={"Brands that appear in the prompt answer."} />
                                    </span>
                                </th>
                                {(rankVisible === "true" || rankVisible == true) && (
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                                        <span>
                                            Rank
                                            <TooltipIcon title={"Brands that appear in the prompt answer."} />
                                        </span>
                                    </th>
                                )}
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                                    <span>
                                        Platforms
                                        <TooltipIcon title={"Platform that appear in the prompt answer."} />
                                    </span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div className="shimmer" style={{ width: '80%', height: '14px', borderRadius: '4px' }} />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div className="shimmer" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div className="shimmer" style={{ width: '50%', height: '14px', borderRadius: '4px' }} />
                                        </td>
                                        {(rankVisible === 'true' || rankVisible === true) && (
                                            <td style={{ padding: '12px' }}>
                                                <div className="shimmer" style={{ width: '50%', height: '14px', borderRadius: '4px' }} />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                        No citations found
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td title={row.prompt} style={{ cursor: "pointer", padding: '12px' }}>
                                            {row.prompt
                                                ? row.prompt.length > 100
                                                    ? row.prompt.substring(0, 100) + "..."
                                                    : row.prompt
                                                : ""}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {/* {(row.brands || []).map((brand, idx) => ( */}
                                                <a
                                                    key={i}
                                                    href={`https://${row.domain}`}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#e7f3ff',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        color: '#0066cc'
                                                    }}
                                                >
                                                    {toTitleCase(competitorMap[row.domain])}
                                                </a>
                                                {/* ))} */}
                                            </div>
                                        </td>
                                        {(rankVisible === "true" || rankVisible == true) && (
                                            <td title={row.rank} style={{ cursor: "pointer", padding: '12px' }}>
                                                {row.rank || "No rank"}
                                            </td>
                                        )}
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                <span
                                                    key={row.taskId}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#f0f0f0',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        textTransform: 'capitalize'
                                                    }}
                                                >
                                                    {LLM_NAME_MAP[row.platform]}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {/* Pagination */}
                {!loading && totalPages > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid #dee2e6'
                    }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} results
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '6px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                Previous
                            </button>
                            {getPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageClick(pageNum)}
                                    style={{
                                        minWidth: '40px',
                                        padding: '6px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: currentPage === pageNum ? '#007bff' : '#fff',
                                        color: currentPage === pageNum ? '#fff' : '#000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '6px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default BrandCitations;