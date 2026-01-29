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
import { FaSpinner } from "react-icons/fa";
import { Loader } from "lucide-react";
import { Icon } from "@iconify/react";
import SnippetCell from "../../components/SnippetCell";
import CompetitorRankings from "./CompetitorsRanking";
import { Tooltip } from 'react-tooltip';


const LLMRankings = () => {
  // Updated state variables for new data structure
  const [sourceData, setSourceData] = useState([]);
  const [citationsData, setCitationsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSourcePages, setTotalSourcePages] = useState(0);
  const [activeKey, setActiveKey] = useState("1");
  const [projects, setProjects] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [urlExpandedRowKeys, setUrlExpandedRowKeys] = useState([]);
  const [columns, setColumns] = useState([]);
  const [urlColumns, setUrlColumns] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalKeywords, setTotalKeywords] = useState(0);
  const [totalCitations, setTotalCitations] = useState(0);
  const [matchingDomain, setMatchingDomain] = useState(0);
  const [keyword, setKeyword] = useState('')
  const [competitorDomains, setCompetitorDomains] = useState([]);


  const { user } = useContext(AuthContext);

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    startDate: "",
    endDate: "",
    project: "",
    user: "",
    domain: "", // Added domain filter for citations
  });
  const [selectedProjectId, setSelectedProjectId] = useState(filter.project);
  const [projectUser, setProjectUser] = useState(filter.user);

  const tabs = {
    keyword: "Prompt Rankings",
    url: "Citations",
  };

  // Helper functions for frontend pagination
  const getCurrentPageData = () => {
    const itemsPerPage = 10;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    if (activeKey === "1") {
      const flatData = sourceData.flat();
      return flatData.slice(startIndex, endIndex);
    } else {
      return citationsData.slice(startIndex, endIndex);
    }
  };

  // Update total pages when tab changes
  useEffect(() => {
    if (activeKey === "1") {
      const flatData = sourceData.flat();
      setTotalSourcePages(Math.ceil(flatData.length / 10));
    } else {
      const flatData = citationsData
      setTotalPages(Math.ceil(flatData.length / 10));
    }
  }, [activeKey, sourceData, citationsData]);


  // Helper function to get project domain
  const getProjectDomain = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    return project?.domain || null;
  };

  // Fetch projects once user is known
  useEffect(() => {
    if (user) {
      setFilter((prev) => ({ ...prev, user: user?._id }));
      setProjectUser(user?._id);
    }
  }, [user]);

  useEffect(() => {
    if (projectUser) {
      fetchProjects();
    }
  }, [projectUser]);

  const fetchProjects = async () => {
    try {
      let filters = {}
      const res = await getLLMProjects(filters, "chatgpt");
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

  // Whenever filter, page, or tab changes, reload tasks
  useEffect(() => {
    if (filter.project) {
      fetchTasks(currentPage, activeKey);
    }
  }, [currentPage, activeKey, filter]);

  const safeDecode = (v) => {
    try {
      return decodeURIComponent(v || "").replace(/\+/g, " ");
    } catch {
      return v;
    }
  };
  // Updated columns for new data structure
  useEffect(() => {
    if (activeKey === "1") {
      // Source Ranking columns
      const dynamicColumns = [
        { title: "Rank", dataIndex: "rank", key: "rank", width: "10%" },
        { title: "Source", dataIndex: "source", key: "source", width: "20%" },
        { title: "Domain", dataIndex: "domain", key: "domain", width: "20%" },
        {
          title: "URL",
          dataIndex: "url",
          key: "url",
          width: "30%",
          render: (url) => (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          ),
        },
        { title: "Title", dataIndex: "title", key: "title", width: "20%" },
      ];
      setColumns(dynamicColumns);
    } else if (activeKey === "2") {
      // Citations columns
      const dynamicColumns = [
        { title: "Source", dataIndex: "source", key: "source", width: "20%" },
        { title: "Domain", dataIndex: "domain", key: "domain", width: "20%" },
        {
          title: "URL",
          dataIndex: "url",
          key: "url",
          width: "30%",
          render: (url) => (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          ),
        },
        { title: "Title", dataIndex: "title", key: "title", width: "30%" },
        { title: "Text", dataIndex: "snippet", key: "snippet", width: "30%" },
      ];
      setUrlColumns(dynamicColumns);
    }
  }, [activeKey]);

  // Updated fetchTasks function for new data structure
  const fetchTasks = async (page = 1, activeTabKey) => {
    setLoading(true);
    try {
      const { startDate, endDate } = filter;
      const formattedStart = startDate
        ? dayjs(startDate).format("YYYY-MM-DD")
        : "";
      const formattedEnd = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

      const baseQuery = {
        tab: activeTabKey === "1" ? "keywordRanking" : "urlRanking",
        ...(activeTabKey === "1" &&
          filter.keyword && {
          keyword: filter.keyword,
        }),
        ...(activeTabKey === "2" && filter.url && { url: filter.url }),
        ...(formattedStart &&
          formattedEnd && {
          startDate: formattedStart,
          endDate: formattedEnd,
        }),
        ...(filter.project && { project: filter.project }),
        ...(filter.domain && { domain: filter.domain }),
      };
      let slug = "llm_chatgpt"

      const response = await getLLMRanks(page, 10, baseQuery, slug);
      const data = response.data.data.tasks.map((task) => task.raw_results[0]);
      const keyword = data.map((item) => {
        return (
          item.keyword
        )
      }
      )
      setKeyword(keyword)
      const domainMatches = response.data.data.domainMatches;
      const totalCitations = response.data.data.totalCitations;
      const totalKeywords = response.data.data.totalKeywords;
      setTotalKeywords(totalKeywords);
      setTotalCitations(totalCitations);
      setMatchingDomain(domainMatches);
      if (data && data.length > 0) {
        // Process source data with rank (index + 1)
        const processedSourceData =
          data?.map((item1) => item1.sources?.map((item, index) => ({
            ...item,
            rank: index + 1, // Add rank as index + 1
            _id: item._id || `source-${index}`, // Ensure _id exists,
            keyword: item1.keyword
          }))) || [];

        // Process citations data with domain filtering
        const allCitationsData = data.map((item) => item.items?.[0]?.sources.map((item1) => ({ ...item1, "keyword": item.keyword })) || []);

        const flattenedCitations = allCitationsData
          .flat() // flatten nested arrays
          .map((item, index) => ({
            ...item,
            _id: item._id || `citation-${index}`,
            keyword: item.keyword
          }));

        const projectDomain = getProjectDomain(filter.project);
        let filteredCitationsData = flattenedCitations;

        // Filter by project domain if available
        if (projectDomain) {
          filteredCitationsData = allCitationsData.filter(
            (item) => item.domain === projectDomain
          );
        }

        // Additional domain filter from UI
        if (filter.domain) {
          filteredCitationsData = flattenedCitations.filter(
            (item) => {
              return item.domain === filter.domain
            }
          );
        }

        // Ensure _id exists for citations
        filteredCitationsData = flattenedCitations.map((item, index) => ({
          ...item,
          _id: item._id || `citation-${index}`,
        }));
        setSourceData(processedSourceData);
        setCitationsData(filteredCitationsData);
      } else {
        setSourceData([]);
        setCitationsData([]);
      }

      setTotalPages(response.data.totalPages || 0);
      setUniqueDates(response.data.uniqueDates || []);
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
        ...(activeKey === "1" && filter.keyword && { keyword: filter.keyword }),
        ...(activeKey === "2" && filter.url && { url: filter.url }),
        ...(filter.project && { project: filter.project }),
      };
      const slug = "llm_chatgpt"

      const response = await exportLLMRankings(exportFilter, slug);

      // axios returns blob directly
      const blob = response.data;

      // Set filename dynamically
      let filename = `${slug}_export.csv`;
      if (activeKey === "1") filename = "source_ranking_export.xlsx";
      if (activeKey === "2") filename = "citations_export.xlsx";

      // Download file
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

  // Get unique domains for filter dropdown
  const getUniqueDomains = () => {
    let filteredData = sourceData.flat()
    const allData = activeKey === "1" ? filteredData : citationsData;
    const domains = [
      ...new Set(allData.map((item) => item?.domain).filter(Boolean)),
    ];
    return domains;
  };

  const totalAveragePosition = competitorDomains.filter((domain) => domain == filter.domain).reduce(
    (sum, d) => sum + (d.averagePosition || 0),
    0
  );

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Chatgpt Rankings
        </h6>
      </div>

      {/* ───── FILTER CARD ───── */}
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

            {/* DOMAIN FILTER - Show only for Citations tab */}
            {/* {activeKey === "2" && ( */}
            {/* <div className="col-md-3">
              <label
                htmlFor="domainFilter"
                className="form-label fw-semibold"
              >
                Domain
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
                  <option key={domain} value={domain}
                
                  >
                    {domain}
                  </option>
                ))}
              </select>
            </div> */}
            {/* )} */}

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
                onClick={() => {
                  const defaultProjectId = projects[0]?._id || "";
                  setFilter({
                    keyword: "",
                    url: "",
                    startDate: "",
                    endDate: "",
                    project: defaultProjectId,
                    domain: "",
                  })
                }
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
                    data-tooltip-id="total-keyword"
                    className="text-muted cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label="More info about prompt rankings"
                    style={{ lineHeight: "0" }}
                  >
                    <Icon icon="fa6-solid:circle-question" className="text-muted" />
                  </span>
                </p>
                {/* <p className="small text-muted mb-1">Total Prompt</p> */}
                <h4 className="mb-0 fw-bold text-primary">{totalKeywords}</h4>
              </div>
              <div className="w-50-px h-50-px bg-primary-subtle rounded-circle d-flex justify-content-center align-items-center">
                <Icon icon="fa6-solid:tag" className="text-primary text-2xl" />
              </div>
            </div>
          </div>
          <Tooltip
            id="total-keyword"
            place="top"
            content="This shows average ranking out of total answers"
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
            content="This shows prompts rankings out of total keywords"
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
            content="This shows total mentions"
            delayShow={150}
          />
        </div>

        {/* Average Rank */}
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
          content="This shows average ranks of the total prompts"
          delayShow={150}
        />
      </div>

      {/* ───── WRAP TABS INSIDE A SINGLE TABLE CARD ───── */}
      <div className="card shadow-sm mt-20">
        {/* Card Header: contains the nav-pills (tabs) */}
        <div className="card-header py-8 px-24 bg-base border border-end-0 border-start-0 border-top-0">
          <ul className="nav focus-tab nav-pills mb-0" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={
                  "nav-link fw-semibold text-primary-light radius-4 px-16 py-10 " +
                  (activeKey === "1" ? "active" : "")
                }
                id="pills-focus-home-tab"
                type="button"
                role="tab"
                aria-controls="pills-focus-home"
                aria-selected={activeKey === "1"}
                onClick={() => {
                  setActiveKey("1");
                  setCurrentPage(1);
                }}
              >
                {tabs.keyword}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={
                  "nav-link fw-semibold text-primary-light radius-4 px-16 py-10 " +
                  (activeKey === "2" ? "active" : "")
                }
                id="pills-focus-details-tab"
                type="button"
                role="tab"
                aria-controls="pills-focus-details"
                aria-selected={activeKey === "2"}
                onClick={() => {
                  setActiveKey("2");
                  setCurrentPage(1);
                }}
              >
                {tabs.url}
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-24 pt-10">
          <div className="tab-content" id="pills-tab-twoContent">
            {/* ── Pane for "Source Ranking" ── */}
            <div
              className={
                "tab-pane fade " + (activeKey === "1" ? "show active" : "")
              }
              id="pills-focus-home"
              role="tabpanel"
              aria-labelledby="pills-focus-home-tab"
              tabIndex={0}
            >
              {loading ? (
                <div className="text-center p-4" style={{ overflowX: "auto" }}>
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  {/* Add this wrapper div for horizontal scrolling */}
                  <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                    <table
                      className="table custom-table"
                      data-page-length="10"
                      style={{
                        border: "1px solid #ddd",
                        minWidth: "1000px" // Set minimum width to ensure columns don't shrink too much
                      }}
                    >
                      <thead className="table-light">
                        <tr>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "200px" // Set minimum width for keyword column
                          }}>
                            Prompt
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "80px" // Set minimum width for rank column
                          }}>
                            Rank
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "225px" // Set minimum width for domain column
                          }}>
                            Domain
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "300px" // Set minimum width for URL column
                          }}>
                            URL
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "400px" // Set minimum width for title column
                          }}>
                            Title
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentPageData().map((row, index) => (
                          <tr key={row?._id || index}>
                            <td style={{
                              color: "#4B5563",
                              padding: "14px 20px",
                              minWidth: "200px",
                              wordBreak: "break-word"
                            }}>
                              {row.keyword || ''}
                            </td>
                            <td style={{
                              color: "#4B5563",
                              padding: "14px 20px",
                              minWidth: "80px"
                            }}>
                              {row?.rank}
                            </td>
                            <td style={{
                              color: "#4B5563",
                              padding: "14px 20px",
                              minWidth: "150px",
                              wordBreak: "break-word"
                            }}>
                              {row?.domain}
                            </td>
                            <td style={{
                              color: "#4B5563",
                              padding: "14px 20px",
                              minWidth: "300px"
                            }}>
                              <a
                                href={row?.url}
                                title={row?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-block",
                                  maxWidth: "280px", // Reduced from 300px to account for padding
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {row?.url}
                              </a>
                            </td>
                            <td style={{
                              color: "#4B5563",
                              padding: "14px 20px",
                              minWidth: "250px",
                              maxWidth: "300px",
                              wordBreak: "break-word"
                            }}>
                              {row?.title}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <nav className="d-flex justify-content-center mt-3">
                    <ul className="pagination mb-0 flex-wrap">
                      {/* Prev button */}
                      <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                        >
                          ‹
                        </button>
                      </li>

                      {/* Show limited page numbers */}
                      {Array.from({ length: totalSourcePages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalSourcePages ||
                            (p >= currentPage - 2 && p <= currentPage + 2)
                        )
                        .map((p, index, array) => (
                          <React.Fragment key={p}>
                            {index > 0 && array[index - 1] !== p - 1 && (
                              <li className="page-item disabled">
                                <span className="page-link">…</span>
                              </li>
                            )}
                            <li
                              className={`page-item ${currentPage === p ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </button>
                            </li>
                          </React.Fragment>
                        ))}

                      {/* Next button */}
                      <li
                        className={`page-item ${currentPage === totalSourcePages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            currentPage < totalSourcePages &&
                            setCurrentPage(currentPage + 1)
                          }
                        >
                          ›
                        </button>
                      </li>
                    </ul>
                  </nav>
                </>
              )}
            </div>

            {/* ── Pane for "Citations" ── */}
            <div
              className={
                "tab-pane fade " + (activeKey === "2" ? "show active" : "")
              }
              id="pills-focus-details"
              role="tabpanel"
              aria-labelledby="pills-focus-details-tab"
              tabIndex={0}
            >
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  {/* Add this wrapper div for horizontal scrolling */}
                  <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                    <table
                      className="table custom-table"
                      data-page-length="10"
                      style={{
                        border: "1px solid #ddd",
                        minWidth: "1200px" // Set minimum width to ensure columns don't shrink too much
                      }}
                    >
                      <thead className="table-light">
                        <tr>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "180px" // Set minimum width for keyword column
                          }}>
                            Prompt
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "150px" // Set minimum width for domain column
                          }}>
                            Domain
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "300px" // Set minimum width for URL column
                          }}>
                            URL
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "250px" // Set minimum width for title column
                          }}>
                            Title
                          </th>
                          <th style={{
                            color: "#333333",
                            padding: "14px 20px",
                            minWidth: "320px" // Set minimum width for text column (largest content)
                          }}>
                            Text
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentPageData().map((row, index) => {
                          return (
                            <tr key={row?._id || index}>
                              <td style={{
                                color: "#4B5563",
                                padding: "14px 20px",
                                minWidth: "200px",
                                wordBreak: "break-word"
                              }}>
                                {row.keyword}
                              </td>
                              <td style={{
                                color: "#4B5563",
                                padding: "14px 20px",
                                minWidth: "260px",
                                wordBreak: "break-word"
                              }}>
                                {row?.domain}
                              </td>
                              <td style={{
                                color: "#4B5563",
                                padding: "14px 20px",
                                minWidth: "300px"
                              }}>
                                <a
                                  href={row?.url}
                                  title={row?.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-block",
                                    maxWidth: "280px", // Reduced to account for padding
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {row?.url}
                                </a>
                              </td>
                              <td style={{
                                color: "#4B5563",
                                padding: "14px 20px",
                                minWidth: "250px",
                                maxWidth: "300px",
                                wordBreak: "break-word"
                              }}>
                                {row?.title}
                              </td>
                              <td style={{
                                color: "#4B5563",
                                padding: "14px 20px",
                                minWidth: "320px",
                                maxWidth: "400px",
                                wordBreak: "break-word",
                                lineHeight: "1.4"
                              }}>
                                {/* {row.snippet || ''} */}
                                <SnippetCell text={row?.snippet || "NA"} />

                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <nav className="d-flex justify-content-center mt-3">
                    <ul className="pagination mb-0 flex-wrap">
                      {/* Prev button */}
                      <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                        >
                          ‹
                        </button>
                      </li>

                      {/* Show limited page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            (p >= currentPage - 2 && p <= currentPage + 2)
                        )
                        .map((p, index, array) => (
                          <React.Fragment key={p}>
                            {index > 0 && array[index - 1] !== p - 1 && (
                              <li className="page-item disabled">
                                <span className="page-link">…</span>
                              </li>
                            )}
                            <li
                              className={`page-item ${currentPage === p ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </button>
                            </li>
                          </React.Fragment>
                        ))}

                      {/* Next button */}
                      <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            currentPage < totalPages &&
                            setCurrentPage(currentPage + 1)
                          }
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
        </div>
      </div>

      {/* Domain rankings table (reusable component) */}
      <CompetitorRankings
        projectId={filter.project}
        startDate={filter.startDate}
        endDate={filter.endDate}
        slug="llm_chatgpt" // change if you want other LLMs
        excludeTarget={false} // set true to hide the project's own domain
        projectTargetDomain={getProjectDomain(filter.project)} // optional, used if excludeTarget true
        topN={100}
        onDomainsChange={(list) => setCompetitorDomains(list)} // ✅ callback
      />
    </div>
  );
};

export default LLMRankings;
