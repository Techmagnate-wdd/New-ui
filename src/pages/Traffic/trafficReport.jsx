import React, { useContext, useEffect, useState } from "react";
import { Table, Tabs, Select, Typography } from "antd";

import {
  exportTrafficReport,
  getTarget,
  getTrafficReport,
} from "../../services/api";
import moment from "moment";
import AuthContext from "../../context/AuthContext";
import { Spin } from "antd";
import { useLocation, useParams } from "react-router-dom";

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

const TrafficReport = () => {
  const [tasks, setTasks] = useState([]);
  const [target, setTarget] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [columns, setColumns] = useState();
  const [formattedData, setFormattedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { user } = useContext(AuthContext);
  const userRole = user?.data?.user?.role || "";
  const { id: targetId } = useParams();

  const [filter, setFilter] = useState({
    target: "",
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
    setLoading(true);
    setFormattedData((d) => ({ ...d, data: [] }));

    try {
      filteredQuery = {
        target_data: targetId,
        ...(filter.target && { target: filter.target }),
        ...(filter.dateRange?.length === 2 && {
          startDate: moment(filter.dateRange[0]).format("YYYY-MM-DD"),
          endDate: moment(filter.dateRange[1]).format("YYYY-MM-DD"),
        }),
      };

      const response = await getTrafficReport(page, limit, filteredQuery);

      setFormattedData({
        data: response.data.data,
        uniqueDates: response.data.dates,
      });

      setCurrentPage(response.data.page);
      setTotalPages(response.data.total);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTarget = async () => {
    const target = await getTarget();
    setTarget(target.data.target);
  };

  const exportData = async () => {
    try {
      setExportLoading(true);
      filteredQuery = {
        target_data: targetId,
        ...(filter.target && { target: filter.target }),
      };
      const response = await exportTrafficReport(filteredQuery);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportLoading(false);
    } catch (error) {
      setExportLoading(false);
      console.error("Export failed:", error);
    }
  };

  useEffect(() => {
    if (!formattedData?.data?.length) return;
    const dates = formattedData?.uniqueDates;

    // 2) build one column per date
    const dynamicColumns = [
      {
        title: "Target",
        dataIndex: "target",
        key: "target",
        // fixed: "left",
        width: 200,
      },
      {
        title: "Spam Score",
        dataIndex: "spam_score",
        key: "spam_score",
        // fixed: "left",
        width: 120,
      },
      {
        title: "Current DA",
        dataIndex: "current_da",
        key: "current_da",
        // fixed: "left",
        width: 120,
      },
      {
        title: "Current PA",
        dataIndex: "current_pa",
        key: "current_pa",
        // fixed: "left",
        width: 120,
      },
      {
        title: "Metric",
        dataIndex: "metric",
        key: "metric",
        // fixed: "left",
        width: 100,
      },

      // one column per month
      ...dates.map((dateLabel) => ({
        title: dateLabel,
        dataIndex: dateLabel,
        key: dateLabel,
        width: 120,
        render: (val) =>
          val != null ? (
            <div style={{ textAlign: "center" }}>{val}</div>
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>N/A</div>
          ),
      })),
    ];

    setColumns(dynamicColumns);
  }, [formattedData, filter]);

  useEffect(() => {
    fetchTarget();
  }, []);

  return (
    <div className="project-dashboard">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="card-header">
          <h6 className="mb-0">Traffic Analysis</h6>
        </div>
        <button
          style={{
            padding: "6px 12px",
            backgroundColor: "#6c757d",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#fff",
          }}
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
      </div>

      <div className="filter-section mt-12">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "1rem",
          }}
        >
          {/* Search input grows to fill */}
          <div style={{ flexGrow: 1 }}>
            <label className="form-label">Search</label>
            <input
              placeholder="Search by Domain"
              className="form-control"
              value={filter?.target}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, target: e.target.value }))
              }
            />
          </div>

          {/* Export button */}
          <div>
            <button
              className="btn btn-secondary"
              disabled={exportLoading}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={exportData}
            >
              {exportLoading ? "Exporting..." : "Export Excel"}
            </button>
            {showTooltip && (
              <div
                style={{
                  position: "absolute",
                  bottom: "120%",
                  color: "#fff",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 1000,
                }}
              >
                {exportLoading
                  ? "Export in progress..."
                  : "Click to download Excel file"}
              </div>
            )}
          </div>

          {/* Reset button */}
          <div>
            <button
              className="btn btn-secondary"
              onClick={() =>
                setFilter({
                  target: "",
                })
              }
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="card basic-data-table mt-20">
        <div className="card-body p-0">
          {/* padded wrapper */}
          <div className="table-wrapper">
            <Table
              className="custom-table"
              rowKey="target"
              columns={columns}
              dataSource={formattedData?.data || []}
              bordered
              scroll={{ x: "max-content" }}
              pagination={false}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficReport;
