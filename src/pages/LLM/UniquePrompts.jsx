import * as XLSX from "xlsx";
import React, { useEffect, useState, useRef, useContext, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getLLMProjects, getLLMPrompts, getLLMPromptsWithBrand } from "../../services/api";
import TooltipIcon from "./ToolTipIcon";
import AuthContext from "../../context/AuthContext";
import { DownloadIcon } from "lucide-react";
import moment from "moment";

const pageSize = 10;

const UniquePrompts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const [searchPrompt, setSearchPrompt] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProject, setSelectedProject] = useState(""); // controlled dropdown value

  const { user } = useContext(AuthContext);
  const userId = user?._id || "";

  const { id: projectIdFromUrl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const transferredDate = queryParams.get("date");
  const rankVisible = queryParams.get("rank");

  // debounce timer refs
  const fetchTimerForFilters = useRef(null);
  const fetchTimerForPage = useRef(null);

  // timer ref for debounce
  const fetchTimer = useRef(null);

  // Active project resolution: prefer selectedProject (dropdown) -> URL param -> localStorage
  const activeProject = useMemo(() => {
    return selectedProject || projectIdFromUrl || localStorage.getItem("selectedProject") || "";
  }, [selectedProject, projectIdFromUrl]);

  // ---------- Fetch projects once ----------
  const fetchProjects = useCallback(async () => {
    try {
      const res = await getLLMProjects({}, userId);
      if (res?.data && Array.isArray(res.data.projects)) {
        setProjects(res.data.projects);
        // if no selectedProject yet, set sensible default
        const stored = localStorage.getItem("selectedProject");
        if (!selectedProject) {
          const pick = projectIdFromUrl || stored || (res.data.projects[0] && res.data.projects[0]._id);
          if (pick) {
            setSelectedProject(pick);
            localStorage.setItem("selectedProject", pick);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching LLM projects:", err);
    }
  }, [userId, projectIdFromUrl, selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, []); // run once

  // ---------- Fetch prompts (debounced) ----------
  const fetchCitations = useCallback(
    async (projId, page = 1) => {
      if (!projId) return;
      setLoading(true);
      try {
        const filters = {
          projectId: projId,
          selectedDate: selectedDate || transferredDate,
        };

        const response = await getLLMPrompts({
          filters,
          page,
          limit: pageSize,
        });

        if (response?.data) {
          const rows = response.data.data.rows || [];
          setData(rows);
          setTotalPages(response.data.data.pagination?.totalPages || 0);
          setTotalRows(response.data.data.pagination?.totalRows || 0);
        } else {
          setData([]);
          setTotalPages(0);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Error fetching citations:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedDate, transferredDate]
  );

  // trigger fetch when activeProject, currentPage, or selectedDate changes (debounced)
  // useEffect(() => {
  //   if (!activeProject) return;
  //   setCurrentPage(1);

  //   // reset to page 1 when project or date changes
  //   // setCurrentPage((prev) => (prev === 1 ? 1 : 1));

  //   if (fetchTimer.current) clearTimeout(fetchTimer.current);
  //   fetchTimer.current = setTimeout(() => {
  //     fetchCitations(activeProject, currentPage);
  //   }, 250); // debounce 250ms

  //   return () => {
  //     if (fetchTimer.current) {
  //       clearTimeout(fetchTimer.current);
  //     }
  //   };
  // }, [activeProject, currentPage, selectedDate, fetchCitations]);


  /* ------- effect A: run when project or date changes (reset page to 1, fetch page 1) ------- */
  useEffect(() => {
    if (!activeProject) return;

    // Reset to page 1 when project or selectedDate changes
    setCurrentPage(1);

    if (fetchTimerForFilters.current) clearTimeout(fetchTimerForFilters.current);
    fetchTimerForFilters.current = setTimeout(() => {
      // explicitly fetch page 1
      fetchCitations(activeProject, 1);
    }, 250);

    return () => {
      if (fetchTimerForFilters.current) {
        clearTimeout(fetchTimerForFilters.current);
      }
    };
  }, [activeProject, selectedDate, transferredDate, fetchCitations]);

  /* ------- effect B: run when currentPage changes (fetch that page) ------- */
  useEffect(() => {
    if (!activeProject) return;

    if (fetchTimerForPage.current) clearTimeout(fetchTimerForPage.current);
    fetchTimerForPage.current = setTimeout(() => {
      fetchCitations(activeProject, currentPage);
    }, 250);

    return () => {
      if (fetchTimerForPage.current) {
        clearTimeout(fetchTimerForPage.current);
      }
    };
  }, [activeProject, currentPage, fetchCitations]);


  // ---------- Handle project changes (dropdown) ----------
  const handleProjectChange = (projId) => {
    if (!projId) return;
    setSelectedProject(projId);
    localStorage.setItem("selectedProject", projId);
    setCurrentPage(1);
  };

  // ---------- Memoized filtered data ----------
  const filteredData = useMemo(() => {
    const query = searchPrompt?.trim().toLowerCase();
    if (!query) return data;
    return data.filter((row) => (row.prompt || "").toLowerCase().includes(query));
  }, [data, searchPrompt]);

  // ---------- Export logic (uses activeProject) ----------
  const handleExport = async () => {
    if (!activeProject) {
      alert("No project selected");
      return;
    }
    setExportLoading(true);

    try {
      const filters = {
        projectId: activeProject,
        selectedDate: selectedDate || transferredDate,
      };

      const batchSize = 1000;
      const totalBatches = Math.max(1, Math.ceil(totalRows / batchSize));
      let allData = [];

      for (let i = 0; i < totalBatches; i++) {
        try {
          const response = await getLLMPrompts({
            filters,
            page: i + 1,
            limit: batchSize,
          });

          if (!response || !response.data) {
            console.warn(`Empty response for batch ${i + 1}`);
            continue;
          }

          const rows = response.data.data.rows || [];
          if (rows.length) {
            allData = allData.concat(rows);
          }
        } catch (batchError) {
          console.error(`Error fetching batch ${i + 1}:`, batchError);
        }
      }

      // apply frontend search filter if present
      if (searchPrompt?.trim()) {
        const q = searchPrompt.trim().toLowerCase();
        allData = allData.filter((row) => (row.prompt || "").toLowerCase().includes(q));
      }

      if (!allData.length) {
        alert("No data to export");
        setExportLoading(false);
        return;
      }

      const worksheetData = [
        ["Prompt"],
        ...allData.map((row) => [
          row.prompt || "",
          // row.lastSeen ? new Date(row.lastSeen).toLocaleDateString() : "",
        ]),
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      worksheet["!cols"] = [{ wch: 60 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, worksheet, "Prompts");

      const filename = `prompts_${new Date().toISOString().split("T")[0]}.xlsx`;
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      alert(`Successfully exported ${allData.length} rows!`);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // ---------- Pagination helpers ----------
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum)
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) startPage = Math.max(1, endPage - maxPagesToShow + 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

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
          zIndex: 9,
        }}
      >
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* PROJECT */}
            <div className="col-md-3">
              <select id="projectSelect" className="form-control" value={selectedProject} onChange={(e) => handleProjectChange(e.target.value)}>
                <option value="">Select Project</option>
                {projects?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Prompt */}
            <div className="col-md-3">
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  width: "100%",
                }}
              />
            </div>

            {/* Date filter */}
            <div className="col-md-2">
              <div className="date-input-wrapper">
                <input
                  id="selectedDate"
                  type="date"
                  className={`form-control ${!selectedDate ? "no-value" : ""}`}
                  value={selectedDate || ""}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>
            </div>

            {/* Back Button */}
            <div className="col-md-2 text-end">
              <button className="btn btn-secondary d-flex align-items-center" onClick={() => navigate(-1)}>
                <span style={{ fontSize: "14px", marginRight: "8px", marginBottom: "3px" }}>←</span>
                <span style={{ fontWeight: 500 }}>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div style={{ background: "#fff", borderRadius: "8px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ margin: 0, color: "#1c2024", fontSize: "22px", fontWeight: 600 }}>Your Prompts</div>
            <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#666" }}>View answers across all prompts</p>
          </div>
          <button onClick={handleExport} disabled={exportLoading} style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#fff", cursor: exportLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: exportLoading ? 0.6 : 1 }}>
            {exportLoading ? "Exporting..." : <DownloadIcon />}
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>
                  <span>
                    Prompt
                    <TooltipIcon title={"The AI-generated query we sent to platforms like ChatGPT, Claude, Perplexity and Gemini."} />
                  </span>
                </th>
                {/* <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>
                  <span>
                    Date
                    <TooltipIcon title={"Date on which prompts were crawled"} />
                  </span>
                </th> */}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "12px" }}>
                      <div className="shimmer" style={{ width: "80%", height: "14px", borderRadius: "4px" }} />
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div className="shimmer" style={{ width: "80%", height: "14px", borderRadius: "4px" }} />
                    </td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                    No citations found
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td title={row.prompt} style={{ cursor: "pointer", padding: "12px" }}>
                      {row.prompt}
                    </td>
                    {/* <td title={row.prompt} style={{ cursor: "pointer", padding: "12px" }}>
                      {moment(row.lastSeen).format("DD-MM-YYYY")}
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #dee2e6" }}>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} results
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}>
                Previous
              </button>
              {getPageNumbers().map((pageNum) => (
                <button key={pageNum} onClick={() => handlePageClick(pageNum)} style={{ minWidth: "40px", padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: currentPage === pageNum ? "#007bff" : "#fff", color: currentPage === pageNum ? "#fff" : "#000", cursor: "pointer" }}>
                  {pageNum}
                </button>
              ))}
              <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniquePrompts;
