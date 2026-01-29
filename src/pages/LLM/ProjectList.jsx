import React, { useContext, useEffect, useState } from "react";
import { Table, Button, Form, Tooltip } from "antd";
import { blockUser, deleteLLMProjects, deleteUser, editLLMProjects, getLLMProjects, getUsers } from "../../services/api";
import dayjs from "dayjs";
import moment from "moment/moment";
import { showToast } from "../../lib/CustomToast";
import { Icon } from "@iconify/react";
// import "../../styles/user.css";
import { useNavigate } from "react-router-dom";
import EditProject from "../../components/EditProject";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import AuthContext from "../../context/AuthContext";

const ProjectList = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectModelOpen, setProjectModelOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [blockingUser, setBlockingUser] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [projectDeleteModelOpen, setProjectDeleteModelOpen] = useState(false);
  const [userBlockModelOpen, setUserBlockModelOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    startDate: "",
    endDate: "",
  });

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Domain", dataIndex: "target", key: "target" },
    {
      title: "LLM",
      dataIndex: "type",
      key: "type",
      render: (type) => Array.isArray(type) ? type.join(", ") : type
    },
    {
      title: "Frequency", dataIndex: "frequency",
      key: "frequency"
    },
    { title: "Keywords", dataIndex: "total_keywords", key: "total_keywords" },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (text ? moment(text).format("MMM D, YYYY") : "-"),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: "200px",
      render: (is_active) => {
        const statusClass = is_active
          ? "status-tag active"
          : "status-tag inactive";
        const label = is_active ? "Active" : "Inactive";
        return <span className={statusClass}>{label}</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      // width: 350,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            whiteSpace: "nowrap",
          }}
        >
          <Tooltip>
            <Button
              type="text"
              size="small"
              onClick={() => handleEdit(record)}
              style={{ display: "flex", alignItems: "center", padding: 4 }}
            >
              <Icon
                icon="mdi:pencil-outline"
                style={{ fontSize: 18, color: "#1890ff" }}
              />
            </Button>
          </Tooltip>

          {/* Delete Icon Button */}
          <Tooltip>
            <Button
              type="text"
              size="small"
              onClick={() => handleDelete(record)}
              style={{ display: "flex", alignItems: "center", padding: 4 }}
            >
              <Icon
                icon="mdi:trash-can-outline"
                style={{ fontSize: 18, color: "#ff4d4f" }}
              />
            </Button>
          </Tooltip>

          {/* Block/Unblock Icon Button */}
          {/* <Tooltip>
            <Button
              type="text"
              size="small"
              // onClick={() => handleBlock(record)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              <Icon
                icon={
                  record.isActive
                    ? "mdi:block-helper"
                    : "mdi:check-circle-outline"
                }
                style={{
                  fontSize: 18,
                  color: record.isActive ? "#ff4d4f" : "#8c8c8c",
                }}
              />
            </Button>
          </Tooltip> */}
        </div>
      ),
    },
  ];

  const fetchProjects = async (filters) => {
    setLoading(true)
    try {
      const startDate = filters.startDate;

      const endDate = filters.endDate;

      const filteredQuery = {
        ...(startDate && endDate && { startDate, endDate }),
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
      };

      const response = await getLLMProjects(filteredQuery);
      setProjects(Array.isArray(response.data.projects) ? response.data.projects : []);
      setLoading(false)
    } catch (err) {
      console.error("Error fetching user:", err);
      setProjects([]);
    } finally {
      setLoading(true)
    }
  };

  useEffect(() => {
    fetchProjects(filters);
  }, [filters, refresh]);

  const handleSearch = (values) => {
    setFilters({
      name: values.name || "",
      email: values.email || "",
      dateRange: values.dateRange || [],
    });
    fetchProjects({
      name: values.name || "",
      email: values.email || "",
      dateRange: values.dateRange || [],
    });
  };

  const handleEdit = (record) => {
    setEditingProject(record);
    setProjectModelOpen(true);
  };


  const handleProjectSubmit = async (payload) => {
    try {
      await editLLMProjects(editingProject._id, payload);
      showToast("Project updated successfully!", "success");

      setProjectModelOpen(false);
      setEditingProject(null);

      // refresh projects
      fetchProjects(filters);
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to update project", "error");
    }
  };

  const confirmDelete = async (projectId) => {
    try {
      await deleteLLMProjects(projectId);
      showToast("Project deleted successfully!", "success");
      setProjectDeleteModelOpen(false);
      fetchProjects(filters)
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete project",
        "error"
      );
    }
  };

  const handleDelete = (record) => {
    setDeletingProject(record);
    setProjectDeleteModelOpen(true);
  };

  return (
    <div className="project-dashboard container1 py-4">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h6 style={{ color: "#4a4a4a", margin: 0 }}>Project List</h6>
        <div style={{ backgroundColor: "#487fff", borderRadius: "4px" }}>
          <button
            onClick={() => navigate("/upload-llm")}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            <Icon
              icon="mdi:plus"
              style={{ fontSize: "24px", marginRight: "4px" }}
            />
            Add Project
          </button>
        </div>
      </div>
      {/* Filter Section */}
      <div className="card mb-2 shadow-sm mt-10">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="nameSearch" className="form-label fw-semibold">
                Name
              </label>
              <input
                id="nameSearch"
                type="text"
                className="form-control"
                placeholder="Search by name"
                value={filters.name}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() =>
                  setFilters({
                    name: "",
                    email: "",
                    startDate: "",
                    endDate: "",
                  })
                }
              >
                Reset
              </button>
            </div>
          </div>

          {projectModelOpen && (
            <div>
              <EditProject
                isOpen={projectModelOpen}
                onClose={() => {
                  setProjectModelOpen(false);
                  setEditingProject(null);
                }}
                editingProject={editingProject}
                onSubmit={handleProjectSubmit}
              />
            </div>
          )}

        </div>
      </div>

      {projectDeleteModelOpen && (
        <ConfirmDeleteModal
          isOpen={projectDeleteModelOpen}
          onClose={() => setProjectDeleteModelOpen(false)}
          onConfirm={confirmDelete}
          project={deletingProject}
        />
      )}

      {/* User Table */}
      <div className="table-wrapper dragscroll mt-20">
        <Table
          className="custom-table"
          rowKey="id"
          dataSource={projects}
          columns={columns}
          loading={loading}
          // pagination={false}
          bordered
        />
      </div>
    </div>
  );
};

export default ProjectList;
