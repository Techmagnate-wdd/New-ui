import React, { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  exportChatgptRankings,
  exportLLMRankings,
  getLLMProjects,
  getLLMRanks,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";
import "../../styles/KeywordsRanking.css";
import { Spinner } from "react-bootstrap";
import { Icon } from "@iconify/react";
import CompetitorRankings from "./CompetitorsRanking";
import { Tooltip } from "react-tooltip";

const GeminiRankings = () => {
  const [citationsData, setCitationsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [projects, setProjects] = useState([]);
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState({
    url: "",
    startDate: "",
    endDate: "",
    project: "",
    domain: "",
  });
  const [selectedProjectId, setSelectedProjectId] = useState(filter.project);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalCitations, setTotalCitations] = useState(0);
  const [totalKeywords, setTotalKeywords] = useState(0);
  const [matchingDomain, setMatchingDomain] = useState(0);
  const [competitorDomains, setCompetitorDomains] = useState([]);

  const { user } = useContext(AuthContext);
  const userRole = user?.data?.user?.role || "";

  const getCurrentPageData = () => {
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return citationsData.slice(startIndex, endIndex);
  };

  // Update total pages
  useEffect(() => {
    const itemsPerPage = 10;
    const newTotalPages = Math.ceil(citationsData.length / itemsPerPage);
    setTotalPages(newTotalPages);

    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [citationsData, currentPage]);

  const getProjectDomain = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    return project?.domain || null;
  };

  useEffect(() => {
    if (user) {
      setFilter((prev) => ({ ...prev, user: user?._id }));
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      let filters = {}
      const res = await getLLMProjects(filters, "perplexity");
      const fetched = res.data.projects || [];
      setProjects(fetched);

      if (fetched.length > 0 && !selectedProjectId) {
        const defaultProjectId = fetched[0]._id;
        setFilter((prev) => ({ ...prev, project: defaultProjectId }));
        setSelectedProjectId(defaultProjectId);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    if (filter.project) {
      fetchTasks(currentPage);
    }
  }, [currentPage, filter]);

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    try {
      const { startDate, endDate } = filter;
      const formattedStart = startDate
        ? dayjs(startDate).format("YYYY-MM-DD")
        : "";
      const formattedEnd = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

      const baseQuery = {
        tab: "urlRanking",
        ...(filter.url && { url: filter.url }),
        ...(formattedStart &&
          formattedEnd && {
          startDate: formattedStart,
          endDate: formattedEnd,
        }),
        ...(filter.project && { project: filter.project }),
      };

      let slug = "llm_perplexity";

      const response = await getLLMRanks(page, 10, baseQuery, slug);
      const data = response.data.data.tasks.map((task) => ({ ...task.raw_results[0], keyword: task.keyword }));
      const keyword = response.data.data.tasks[0].keyword;
      setKeyword(safeDecode(keyword))
      const domainMatches = response.data.data.domainMatches;
      const totalCitations = response.data.data.totalCitations;
      const totalKeywords = response.data.data.totalKeywords;
      setTotalKeywords(totalKeywords);
      setTotalCitations(totalCitations);
      setMatchingDomain(domainMatches);
      if (data && data.length > 0) {
        const allCitationsData = data.map((item) => item.items[0]?.sections[0]?.annotations.map((item1 => ({ ...item1, "keyword": safeDecode(item.keyword) }))) || []);
        const projectDomain = getProjectDomain(filter.project);
        let filteredCitationsData = allCitationsData.flatMap(item =>
          // convert the object with numeric keys into values
          Object.values(item).filter(v => typeof v === "object" && v.url)
        );

        if (projectDomain) {
          filteredCitationsData = allCitationsData.filter(
            (item) => item.domain === projectDomain
          );
        }

        if (filter.domain) {
          filteredCitationsData = filteredCitationsData.filter(
            (item) => item.domain === filter.domain
          );
        }

        filteredCitationsData = filteredCitationsData.map((item, index) => ({
          ...item,
          _id: item._id || `citation-${index}`,
          keyword: item.keyword
        }));
        setCitationsData(filteredCitationsData);
      } else {
        setCitationsData([]);
      }

      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setExportLoading(true)
    try {
      const exportFilter = {
        ...(filter.url && { url: filter.url }),
        ...(filter.project && { project: filter.project }),
      };
      const slug = "llm_perplexity"
      const response = await exportLLMRankings(exportFilter, slug);
      const blob = response.data;
      const filename = `${slug}_citations_export.xlsx`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExportLoading(false)
    }
  };

  const safeDecode = (v) => {
    try {
      return decodeURIComponent(v || "").replace(/\+/g, " ");
    } catch {
      return v;
    }
  };

  const getUniqueDomains = () => {
    const domains = [...new Set(citationsData.map((item) => item.domain).filter(Boolean))];
    return domains;
  };


  const totalAveragePosition = competitorDomains.filter((item) => item.domain === filter.project).reduce(
    (sum, d) => sum + (d.averagePosition || 0),
    0
  );

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Perplexity Citations
        </h6>
      </div>

      {/* ───── FILTER CARD ───── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            <div className="col-md-3">
              <label htmlFor="projectSelect" className="form-label fw-semibold">
                Project
              </label>
              <select
                id="projectSelect"
                className="form-control"
                value={filter.project}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, project: val }));
                  setSelectedProjectId(val);
                  setCurrentPage(1);
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

            {/* <div className="col-md-3">
              <label htmlFor="domainFilter" className="form-label fw-semibold">
                Domain Filter
              </label>
              <select
                id="domainFilter"
                className="form-control"
                value={filter.domain || ""}
                onChange={(e) => {
                  setFilter((prev) => ({ ...prev, domain: e.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option value="">All Domains</option>
                {getUniqueDomains().map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div> */}

            {/* START DATE */}
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={filter.startDate || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }));
                }}
              />
            </div>

            {/* END DATE */}
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control"
                value={filter.endDate || ""}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }));
                }}
              />
            </div>

            {/* RESET */}
            <div className="col-md-1 align-items-end pt-6">
              <button
                className="btn btn-secondary w-100"
                onClick={() =>
                  setFilter({
                    url: "",
                    startDate: "",
                    endDate: "",
                    project: "",
                    domain: "",
                  })
                }
              >
                Reset
              </button>
            </div>

            {/* Export */}
            <div className="col-md-1 align-items-start pt-6">
              <button
                className="btn btn-primary w-[100%]"
                onClick={exportData}
                disabled={exportLoading}   // ✅ this handles disabling
              >
                {exportLoading ? "Processing" : "Export"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* cards */}

      <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4 pt-12">
        {/* Total Keywords */}
        <div className="col">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
            <div className="card-body p-20 d-flex justify-content-between align-items-center">
              <div>
                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                  <span>Total Prompt</span>
                  <span
                    data-tooltip-id="Total Prompt"
                    className="text-muted cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label="More info about prompt rankings"
                    style={{ lineHeight: "0" }}
                  >
                    <Icon icon="fa6-solid:circle-question" className="text-muted" />
                  </span>
                </p>
                <h4 className="mb-0 fw-bold text-primary">{totalKeywords}</h4>
              </div>
              <div className="w-50-px h-50-px bg-primary-subtle rounded-circle d-flex justify-content-center align-items-center">
                <Icon icon="fa6-solid:tag" className="text-primary text-2xl" />
              </div>
            </div>
          </div>
          <Tooltip
            id="Total Prompt"
            place="top"
            content="This shows total prompts"
            delayShow={150}
          />
        </div>

        {/* Matching Domain */}
        <div className="col">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
            <div className="card-body p-20 d-flex justify-content-between align-items-center">
              <div>
                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                  <span>Prompt Rankings</span>
                  <span
                    data-tooltip-id="Prompt Rankings"
                    className="text-muted cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label="More info about prompt rankings"
                    style={{ lineHeight: "0" }}
                  >
                    <Icon icon="fa6-solid:circle-question" className="text-muted" />
                  </span>
                </p>
                <h4 className="mb-0 fw-bold text-success">{matchingDomain}/{totalKeywords}</h4>
              </div>
              <div className="w-50-px h-50-px bg-success-subtle rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="fa6-solid:check"
                  className="text-success text-2xl"
                />
              </div>
            </div>
          </div>
          <Tooltip
            id="Prompt Rankings"
            place="top"
            content="This shows prompts ranking out of all prompts"
            delayShow={150}
          />
        </div>

        {/* Total Citations */}
        <div className="col">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
            <div className="card-body p-20 d-flex justify-content-between align-items-center">
              <div>
                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                  <span>Total Mentions</span>
                  <span
                    data-tooltip-id="Total Mentions"
                    className="text-muted cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label="More info about prompt rankings"
                    style={{ lineHeight: "0" }}
                  >
                    <Icon icon="fa6-solid:circle-question" className="text-muted" />
                  </span>
                </p>
                <h4 className="mb-0 fw-bold text-purple">{totalCitations}</h4>
              </div>
              <div className="w-50-px h-50-px bg-purple-subtle rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="fa6-solid:database"
                  className="text-purple text-2xl"
                />
              </div>
            </div>
          </div>
          <Tooltip
            id="Total Mentions"
            place="top"
            content="This shows total mentions of a project"
            delayShow={150}
          />
        </div>

        {/* Average position */}
        <div className="col">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
            <div className="card-body p-20 d-flex justify-content-between align-items-center">
              <div>
                <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                  <span>Average Rank</span>
                  <span
                    data-tooltip-id="Average Rank"
                    className="text-muted cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label="More info about prompt rankings"
                    style={{ lineHeight: "0" }}
                  >
                    <Icon icon="fa6-solid:circle-question" className="text-muted" />
                  </span>
                </p>
                <h4 className="mb-0 fw-bold text-blue-600">
                  {totalAveragePosition.toFixed(2)}
                </h4>
              </div>
              <div className="w-50-px h-50-px bg-blue-100 rounded-circle d-flex justify-content-center align-items-center">
                <Icon icon="fa6-solid:chart-line" className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>
        <Tooltip
          id="Average Rank"
          place="top"
          content="This shows average rankings of a project"
          delayShow={150}
        />
      </div>

      {/* ───── CITATIONS TABLE ───── */}
      <div className="card shadow-sm mt-20">
        <div className="card-body p-24 pt-10">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <table
                className="table custom-table"
                data-page-length="10"
                style={{ border: "1px solid #ddd" }}
              >
                <thead className="table-light">
                  <tr>
                    <th style={{ color: "#333333", padding: "14px 20px" }}>Prompt</th> {/* Index column */}
                    <th style={{ color: "#333333", padding: "14px 20px" }}>Rank</th> {/* Index column */}
                    <th style={{ color: "#333333", padding: "14px 20px" }}>Title</th>
                    <th style={{ color: "#333333", padding: "14px 20px" }}>URL</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((row, index) => (
                    <tr key={row._id || index}>
                      <td style={{ color: "#4B5563", padding: "14px 20px" }}>
                        {row.keyword}                      </td>
                      <td style={{ color: "#4B5563", padding: "14px 20px" }}>
                        {(currentPage - 1) * 10 + index + 1}                      </td>
                      <td style={{ color: "#4B5563", padding: "14px 20px" }}>{row.title}</td>
                      <td style={{ color: "#4B5563", padding: "14px 20px" }}>
                        <a
                          href={row.url}
                          title={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            maxWidth: 300,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {row.url}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination mb-0 flex-wrap">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    >
                      ‹
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                    .map((p, index, array) => (
                      <React.Fragment key={p}>
                        {index > 0 && array[index - 1] !== p - 1 && (
                          <li className="page-item disabled"><span className="page-link">…</span></li>
                        )}
                        <li className={`page-item ${currentPage === p ? "active" : ""}`}>
                          <button className="page-link" onClick={() => setCurrentPage(p)}>
                            {p}
                          </button>
                        </li>
                      </React.Fragment>
                    ))}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    >
                      ›
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
      {/* Domain rankings table (reusable component) */}
      <CompetitorRankings
        projectId={filter.project}
        startDate={filter.startDate}
        endDate={filter.endDate}
        slug="llm_perplexity" // change if you want other LLMs
        excludeTarget={false} // set true to hide the project's own domain
        projectTargetDomain={getProjectDomain(filter.project)} // optional, used if excludeTarget true
        topN={100}
        onDomainsChange={(list) => setCompetitorDomains(list)} // ✅ callback

      />
    </div>
  );
};

export default GeminiRankings;
