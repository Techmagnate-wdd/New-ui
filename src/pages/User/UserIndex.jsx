import React, { useEffect, useState } from "react";
import { Table, Button, Form, Tooltip } from "antd";
import { blockUser, deleteUser, getUsers } from "../../services/api";
import dayjs from "dayjs";
import moment from "moment/moment";
import { showToast } from "../../lib/CustomToast";
import EditUser from "./EditUser";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ConfirmBlockModal from "./ConfirmBlockModal";
import { Icon } from "@iconify/react";
import "../../styles/user.css";
import { useNavigate } from "react-router-dom";

const UserIndex = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userModelOpen, setUserModelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [blockingUser, setBlockingUser] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [userDeleteModelOpen, setUserDeleteModelOpen] = useState(false);
  const [userBlockModelOpen, setUserBlockModelOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    startDate: "",
    endDate: "",
  });

  const columns = [
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (text ? moment(text).format("MMM D, YYYY") : "-"),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => {
        const statusClass = isActive
          ? "status-tag active"
          : "status-tag inactive";
        const label = isActive ? "Active" : "Inactive";
        return <span className={statusClass}>{label}</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 350,
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
          <Tooltip>
            <Button
              type="text"
              size="small"
              onClick={() => handleBlock(record)}
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
          </Tooltip>
        </div>
      ),
    },
  ];

  const fetchUsers = async (filters) => {
    try {
      const startDate = filters.startDate;

      const endDate = filters.endDate;

      const filteredQuery = {
        ...(startDate && endDate && { startDate, endDate }),
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
      };

      const response = await getUsers(filteredQuery);
      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers(filters);
  }, [filters, refresh]);

  const handleSearch = (values) => {
    setFilters({
      name: values.name || "",
      email: values.email || "",
      dateRange: values.dateRange || [],
    });
    fetchUsers({
      name: values.name || "",
      email: values.email || "",
      dateRange: values.dateRange || [],
    });
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    setUserModelOpen(true);
  };

  const handleDelete = (record) => {
    setDeletingUser(record);
    setUserDeleteModelOpen(true);
  };

  const handleBlock = (record) => {
    setBlockingUser(record);
    setUserBlockModelOpen(true);
  };

  const handleUserSubmit = (updatedUser) => {
    setUserModelOpen(false);
    setEditingUser(null);
  };

  const confirmDelete = async (userId) => {
    try {
      await deleteUser(userId);
      showToast("User deleted successfully!", "success");
      setUserDeleteModelOpen(false);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete user",
        "error"
      );
    }
  };

  const confirmBlock = async (userId) => {
    try {
      const res = await blockUser(userId);
      let toastMessage = res.data.message;
      showToast(`${toastMessage}!`, "success");
      setRefresh((prev) => !prev);
      setUserBlockModelOpen(false);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to block user",
        "error"
      );
    }
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
        <h6 style={{ color: "#4a4a4a", margin: 0 }}>User List</h6>
        <div style={{ backgroundColor: "#487fff", borderRadius: "4px" }}>
          <button
            onClick={() => navigate("/add-user")}
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
            Add User
          </button>
        </div>
      </div>
      {/* Filter Section */}
      <div className="card mb-2 shadow-sm mt-10">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            <div className="col-md-6">
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

            <div className="col-md-6">
              <label htmlFor="emailSearch" className="form-label fw-semibold">
                Email
              </label>
              <input
                id="emailSearch"
                type="email"
                className="form-control"
                placeholder="Search by email"
                value={filters.email}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="col-md-5">
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

            <div className="col-md-5">
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
          {userModelOpen && (
            <div>
              <EditUser
                isOpen={userModelOpen}
                onClose={() => {
                  setUserModelOpen(false);

                  setEditingUser(null);
                }}
                editingUser={editingUser}
                onSubmit={handleUserSubmit}
              />
            </div>
          )}

          {userDeleteModelOpen && (
            <ConfirmDeleteModal
              isOpen={userDeleteModelOpen}
              onClose={() => setUserDeleteModelOpen(false)}
              onConfirm={confirmDelete}
              user={deletingUser}
            />
          )}

          {userBlockModelOpen && (
            <ConfirmBlockModal
              isOpen={userBlockModelOpen}
              onClose={() => setUserBlockModelOpen(false)}
              onConfirm={confirmBlock}
              user={blockingUser}
            />
          )}
        </div>
      </div>
      {/* User Table */}
      <div className="table-wrapper dragscroll mt-20">
        <Table
          className="custom-table"
          rowKey="id"
          dataSource={users}
          columns={columns}
          // pagination={false}
          bordered
        />
      </div>
    </div>
  );
};

export default UserIndex;
