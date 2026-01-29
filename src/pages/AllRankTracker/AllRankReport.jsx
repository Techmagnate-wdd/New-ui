import React, { useEffect, useState } from "react";
import { Table, Tooltip } from "antd";
import { CaretUpFilled, CaretDownFilled, StarFilled } from "@ant-design/icons";
import RankTrackerCard from "./RankTrackerCard";

import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

import moment from "moment";
import { Spin } from "antd";
import { useParams } from "react-router-dom";
import "../../styles/RankTracker.css";

import {
  exportAllRankExcel,
  getAllRankKeywords,
  getAllRankReport,
} from "../../services/api";
export const API_BASE_URL = "http://localhost:5000";
// const API_BASE_URL = "https://rank-tracker.techmagnate.com";

const GoogleRankChart = ({ googleChartData, stats }) => {
  const labels = googleChartData.map((pt) =>
    new Date(pt.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  );
  const dataPoints = googleChartData.map((pt) => pt.change);

  const data = {
    labels,
    datasets: [
      {
        label: "Google Change",
        data: dataPoints,
        borderColor: "#4285F4",
        backgroundColor: "rgba(66,133,244,0.1)",
        tension: 0.3,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 30,
        left: 10,
        right: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#555",
          maxRotation: 0,
          minRotation: 0,
        },
        title: {
          display: true,
          text: "Date",
          color: "#333",
          font: { size: 12, weight: "600" },
        },
      },
      y: {
        grid: {
          color: "#e0e0e0",
        },
        ticks: {
          color: "#555",
        },
        title: {
          display: true,
          color: "#333",
          font: { size: 12, weight: "600" },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#333",
        bodyColor: "#222",
        borderColor: "#e0e0e0",
        borderWidth: 1,
        titleFont: { weight: "600" },
        bodyFont: { size: 12 },
        boxPadding: 6,
        boxWidth: 8,
      },
    },
  };

  // Container gradient style: white → light-blue
  const containerStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #e0f7ff 100%)",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: 20,
    margin: "20px auto",
    width: "100%",
    height: 400,
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {/* Top-left label */}
        <span
          style={{
            fontSize: 12,
            color: "#666666",
            fontWeight: 600,
          }}
        >
          Google Change
        </span>

        {/* Top-right stat with arrow */}
        <Tooltip>
          <span
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: stats >= 0 ? "#2e7d32" : "#c62828",
            }}
          >
            {stats >= 0 ? "▲ " : "▼ "}
            {Math.abs(stats).toLocaleString()}
          </span>
        </Tooltip>
      </div>

      {/* Chart area */}
      <Line data={data} options={options} />
    </div>
  );
};

const AllRankReport = () => {
  const [tasks, setTasks] = useState([]);
  const [target, setTarget] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [columns, setColumns] = useState();
  const [formattedData, setFormattedData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [summary, setSummary] = useState();
  const { id: targetId } = useParams();
  const [filter, setFilter] = useState({
    keyword: "",
    location: "",
  });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await fetchTasks(currentPage);
      setLoading(false);
    };
    run();
  }, [filter, currentPage]);

  let filteredQuery;

  const fetchTasks = async (page = 1) => {
    try {
      filteredQuery = {
        project_id: targetId,
        ...(filter.keyword && { keyword: filter.keyword }),
        ...(filter.location && { location: filter.location }),
        ...(filter.dateRange?.length === 2 && {
          startDate: moment(filter.dateRange[0]).format("YYYY-MM-DD"),
          endDate: moment(filter.dateRange[1]).format("YYYY-MM-DD"),
        }),
      };

      const response = await getAllRankReport(page, limit, filteredQuery);
      setSummary(response.data.summary);
      setChartData(response.data.googleChartData);

      setFormattedData({
        data: response.data,
        dates: response.dates,
      });

      setCurrentPage(response.page);
      setTotalPages(response.total);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchTarget = async () => {
    const target = await getAllRankKeywords();
    setTarget(target.data.target);
  };

  const exportData = async () => {
    try {
      setExportLoading(true);

      // Build your filter object
      const filterObj = {
        project_id: targetId,
        ...(filter.target && { target: filter.target }),
      };

      // Fetch the Excel file as binary
      const response = exportAllRankExcel(filterObj);

      // Wrap it in a Blob with the proper Excel MIME type
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link & click it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all_rank.xlsx"; // ← use .xlsx extension
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportPdf = async () => {
    try {
      filteredQuery = {
        project_id: targetId,
        ...(filter.target && { target: filter.target }),
      };
      const url = `${API_BASE_URL}/api/all-rank/export-pdf?filter=${encodeURIComponent(
        JSON.stringify(filteredQuery)
      )}`;

      window.location.href = url;
    } catch (error) {
      console.error("❌ Failed to export PDF:", error);
    }
  };

  const changeRender = (val) => {
    if (val == null)
      return (
        <span
          style={{
            color: "#999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          N/A
        </span>
      );
    if (val === 0)
      return (
        <span
          style={{
            color: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          0
        </span>
      );
    const isPositive = val > 0;
    const Icon = isPositive ? CaretUpFilled : CaretDownFilled;
    const color = isPositive ? "green" : "red";

    return (
      <span
        style={{
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon style={{ marginRight: 4 }} />
        {Math.abs(val)}
      </span>
    );
  };

  useEffect(() => {
    if (!formattedData?.data?.data?.length) return;
    const data = formattedData?.data?.data;

    const summaryStats = {
      googleCount: data.filter((d) => d.google && d.google !== "N/A").length,
      googleChangeSum: data.reduce((sum, d) => sum + (d.googleChange ?? 0), 0),

      googleLocalCount: data.filter(
        (d) => d.googleLocal && d.googleLocal !== "N/A"
      ).length,
      googleLocalChangeSum: data.reduce(
        (sum, d) => sum + (d.googleLocalChange ?? 0),
        0
      ),

      bingCount: data.filter((d) => d.bing && d.bing !== "N/A").length,
      bingChangeSum: data.reduce((sum, d) => sum + (d.bingChange ?? 0), 0),

      searchVolumeSum: data.reduce((sum, d) => sum + (d.volume ?? 0), 0),
    };
    setSummary(summaryStats);

    const dynamicColumns = [
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            KEYWORD
          </span>
        ),
        dataIndex: "keyword",
        key: "keyword",
        width: 200,
        render: (text) => (
          <span
            style={{ display: "flex", alignItems: "center", color: "#333" }}
          >
            <StarFilled
              style={{ color: "gold", marginRight: 12, fontSize: "14px" }}
            />
            {text}
          </span>
        ),
      },
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            LOCATION
          </span>
        ),
        dataIndex: "location",
        key: "location",
        width: 160,
        render: (locationObj) => {
          const iso = locationObj?.isoCode?.toLowerCase() ?? "us";
          const label = locationObj?.location ?? "Unknown";

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8, // ← adds 8px between flag and text
                color: "#333",
                justifyContent: "flex-start",
              }}
            >
              <img
                src={`https://flagcdn.com/32x24/${iso}.png`}
                alt={label}
                style={{ width: 24, height: 18, objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span>{label}</span>
            </div>
          );
        },
      },

      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            GOOGLE
          </span>
        ),
        dataIndex: "google",
        key: "google",
        width: 120,
        render: (text) => (
          <span
            style={{
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {text}
          </span>
        ),
      },
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            GOOGLE CHANGE
          </span>
        ),
        dataIndex: "googleChange",
        key: "googleChange",
        width: 140,
        render: changeRender,
      },
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            BING
          </span>
        ),
        dataIndex: "bing",
        key: "bing",
        width: 120,
        render: (text) => (
          <span
            style={{
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {text}
          </span>
        ),
      },
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            BING CHANGE
          </span>
        ),
        dataIndex: "bingChange",
        key: "bingChange",
        width: 140,
        render: changeRender,
      },
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            GOOGLE LOCAL
          </span>
        ),
        dataIndex: "googleLocal",
        key: "googleLocal",
        width: 140,
        render: (text) => (
          <span
            style={{
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {text}
          </span>
        ),
      },
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            GOOGLE LOCAL CHANGE
          </span>
        ),
        dataIndex: "googleLocalChange",
        key: "googleLocalChange",
        width: 200,
        render: changeRender,
      },
      {
        title: (
          <span
            style={{
              fontWeight: 600,
              color: "#333",
              fontSize: "10px",
              display: "flex",
              alignItems: "left",
              justifyContent: "left",
            }}
          >
            VOLUME
          </span>
        ),
        dataIndex: "volume",
        key: "volume",
        width: 120,
        render: (val) => (
          <div
            style={{
              display: "flex",
              alignItems: "left",
              justifyContent: "left",
            }}
          >
            {val?.toLocaleString() ?? "0"}
          </div>
        ),
      },
    ];
    setColumns(dynamicColumns);
  }, [formattedData]);

  useEffect(() => {
    fetchTarget();
  }, []);

  return (
    <div className="project-dashboard container1 py-4">
      {/* ====== Page Header ====== */}
      <div className="d-flex align-items-center justify-content-between mb-20">
        <div>
          <h6 className="fw-bold mb-0" style={{ color: "#4a4a4a" }}>
            Rank Tracker
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

      {/* ====== Filters Card ====== */}
      <div className="card mb-2 shadow-sm">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* Keyword Search */}
            <div className="col-md-4">
              <label htmlFor="keywordSearch" className="form-label fw-semibold">
                Keyword
              </label>
              <input
                id="keywordSearch"
                type="text"
                className="form-control"
                placeholder="Search by Keyword"
                value={filter.keyword}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, keyword: e.target.value }))
                }
              />
            </div>

            {/* Location Search */}
            <div className="col-md-4">
              <label
                htmlFor="locationSearch"
                className="form-label fw-semibold"
              >
                Location
              </label>
              <input
                id="locationSearch"
                type="text"
                className="form-control"
                placeholder="Search by Location"
                value={filter.location}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            {/* Export & Reset Buttons */}
            <div className="col-md-4 d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary flex-grow-1"
                onClick={exportData}
              >
                <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                Export Excel
              </button>

              <button
                type="button"
                className="btn btn-primary flex-grow-1"
                onClick={exportPdf}
              >
                <i className="bi bi-filetype-pdf me-1"></i>
                Export PDF
              </button>

              <button
                type="button"
                className="btn btn-secondary flex-grow-1"
                onClick={() =>
                  setFilter({
                    keyword: "",
                    location: "",
                  })
                }
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====== Chart Section ====== */}
      <div className="mb-4">
        {chartData?.length ? (
          <GoogleRankChart
            googleChartData={chartData}
            stats={summary?.googleChangeSum}
          />
        ) : (
          <p>Loading chart…</p>
        )}
      </div>

      {/* ====== Stats Cards ====== */}
      <div className="mb-4">
        <RankTrackerCard stats={summary} />
      </div>

      {/* ====== Data Table ====== */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      ) : (
        <div className="table-wrapper dragscroll mt-20 mb-5">
          <Table
            className="custom-table"
            rowKey="target"
            columns={columns}
            dataSource={formattedData?.data?.data || []}
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default AllRankReport;
