import React, { useState, useEffect, useMemo } from "react";
import { Table, Spin, Button } from "antd";
import dayjs from "dayjs";
import {
  exportAIModeCsv,
  getAIModeProjects,
  getAIModeRanks,
} from "../../services/api";

const AIModeReport = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState({
    project: "",
    date: null, // start null so we pick it dynamically
    keywordFilter: "",
    domainFilter: null,
  });
  const [rawData, setRawData] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 1) Load projects on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getAIModeProjects();
        const projs = res.data.projects || [];
        setProjects(projs);
        if (projs.length) {
          setFilter((f) => ({ ...f, project: projs[0]._id }));
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      }
    })();
  }, []);

  // 2) Once project is set, fetch all dates and pick the latest
  useEffect(() => {
    if (!filter.project) return;
    (async () => {
      try {
        const res = await getAIModeRanks({ projectId: filter.project });
        const entries = res.data.data || [];
        if (entries.length) {
          // find the max date among entries
          const maxDate = entries
            .map((e) => new Date(e.date))
            .reduce((a, b) => (a > b ? a : b));
          setFilter((f) => ({ ...f, date: dayjs(maxDate) }));
        }
      } catch (err) {
        console.error("Error picking default date:", err);
      }
    })();
  }, [filter.project]);

  // 3) Fetch & flatten whenever project or date changes
  useEffect(() => {
    if (!filter.project || !filter.date) return;
    setLoading(true);
    (async () => {
      try {
        const dateStr = dayjs(filter.date).format("YYYY-MM-DD");
        const params = {
          projectId: filter.project,
          startDate: dateStr,
          endDate: dateStr,
        };
        const res = await getAIModeRanks(params);
        const flat = (res.data.data || []).flatMap((entry) => {
          const cleanKeyword = (entry.keyword || "").replace(/%40/g, "");
          return (entry.references || []).map((ref, idx) => ({
            keyword: cleanKeyword,
            date: entry.date,
            rank: idx + 1,
            source: ref.source,
            domain: ref.domain,
            url: ref.url,
            title: ref.title,
            text: ref.text,
          }));
        });
        setRawData(flat);
        setDomains([...new Set(flat.map((r) => r.domain))]);
      } catch (err) {
        console.error("Error fetching AI Mode data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [filter.project, filter.date]);

  // 4) Apply keyword & domain filters client-side
  const data = useMemo(() => {
    return rawData
      .filter((r) =>
        filter.keywordFilter
          ? r.keyword.toLowerCase().includes(filter.keywordFilter.toLowerCase())
          : true
      )
      .filter((r) =>
        filter.domainFilter ? r.domain === filter.domainFilter : true
      );
  }, [rawData, filter.keywordFilter, filter.domainFilter]);

  // 5) Table columns
  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword" },
    { title: "Rank", dataIndex: "rank", key: "rank" },
    { title: "Source", dataIndex: "source", key: "source" },
    { title: "Domain", dataIndex: "domain", key: "domain" },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (u) => (
        <a href={u} target="_blank" rel="noopener noreferrer">
          {u}
        </a>
      ),
    },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Text", dataIndex: "text", key: "text" },
  ];

  // reset handler
  const handleReset = () => {
    setFilter((f) => ({
      ...f,
      date: dayjs(), // reset to today until real fetch picks actual
      keywordFilter: "",
      domainFilter: null,
    }));
  };

  // export handler
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const dateStr = dayjs(filter.date).format("YYYY-MM-DD");
      const apiFilter = {
        projectId: filter.project,
        startDate: dateStr,
        endDate: dateStr,
      };
      const blobData = await exportAIModeCsv(apiFilter);
      const csvBlob =
        blobData instanceof Blob
          ? blobData
          : new Blob([blobData], { type: "text/csv" });
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ai_mode_data.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="project-dashboard container1 py-4">
      <div className="d-flex align-items-center justify-content-between mb-20">
        <div>
          <h6 className="fw-bold mb-0" style={{ color: "#4a4a4a" }}>
            AI Mode Performance
          </h6>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={() => window.history.back()}
        >
          <i className="bi bi-arrow-left-short me-1"></i>
          Back
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-2 shadow-sm">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* project */}
            <div className="col-md-4">
              <label htmlFor="projectFilter" className="form-label fw-semibold">
                Project
              </label>
              <select
                id="projectFilter"
                className="form-select"
                value={filter.project}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, project: e.target.value }))
                }
              >
                <option value="">Select a project</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="col-md-4">
              <label htmlFor="dateFilter" className="form-label fw-semibold">
                Date
              </label>
              <input
                id="dateFilter"
                type="date"
                className="form-control"
                value={filter.date || ""}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>

            {/* Keyword filter */}
            <div className="col-md-4">
              <label htmlFor="keyword" className="form-label fw-semibold">
                Keyword
              </label>
              <input
                id="keywordSearch"
                type="text"
                className="form-control"
                placeholder="Search by keyword"
                value={filter.keywordFilter}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    keywordFilter: e.target.value,
                  }))
                }
              />
            </div>

            {/* Domain filter */}
            <div className="col-md-4">
              <label htmlFor="domainFilter" className="form-label fw-semibold">
                Domain
              </label>
              <select
                id="domainFilter"
                className="form-select"
                value={filter.domainFilter || ""}
                onChange={(e) =>
                  setFilter((f) => ({
                    ...f,
                    domainFilter: e.target.value || "",
                  }))
                }
                style={{ minWidth: 200 }}
              >
                {/* placeholder / clear option */}
                <option value="">Filter by domain</option>

                {/* actual domain options */}
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 d-flex gap-2">
              {/* Reset */}
              <button
                type="button"
                className="btn btn-secondary flex-grow-1"
                onClick={handleReset}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset
              </button>

              {/* Export Excel */}
              <button
                type="button"
                className="btn btn-primary flex-grow-1"
                onClick={handleExportExcel}
              >
                <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table or spinner */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      ) : (
        <div className="table-wrapper dragscroll mt-20 mb-5">
          <Table
            className="custom-table"
            rowKey={(r) => `${r.date}-${r.rank}-${r.domain}`}
            columns={columns}
            dataSource={data}
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </div>
      )}
    </div>
  );
};

export default AIModeReport;
