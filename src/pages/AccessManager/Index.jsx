import React, { useEffect, useState, useContext } from "react";
import {
  fetchModules,
  getAllUsers,
  assignUserModules,
  getUsers,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";
// import { Table, Tag, Button, Modal, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Modal, Button, Badge } from "react-bootstrap";
import { Table, Tag } from "antd";
import { showToast } from "../../lib/CustomToast";
import { Icon } from "@iconify/react/dist/iconify.js";

// const { Text } = Typography;

export default function AccessManager() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
  });

  // modal state
  const [modalUser, setModalUser] = useState(null);
  const [pendingKeys, setPendingKeys] = useState([]);

  useEffect(() => {
    (async () => {
      const filteredQuery = { ...(filters.name && { name: filters.name }) };
      const [uRes, mRes] = await Promise.all([
        getUsers(filteredQuery),
        fetchModules(),
      ]);
      setUsers(uRes.data.data);
      setModules(mRes.data.data);
    })();
  }, [filters]);

  if (!user || user.role !== "admin") {
    return <p className="p-8 text-red-600">Access denied</p>;
  }

  const openModal = (record) => {
    setModalUser(record);
    const orig = record.access || [];
    setPendingKeys(orig.includes("LLM_DASHBOARD") ? orig : ["LLM_DASHBOARD", ...orig]);
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const finalKeys = Array.from(new Set([...pendingKeys, "LLM_DASHBOARD"]));
      await assignUserModules(modalUser._id, finalKeys);
      showToast("Role has been updated successfully!", "success");
      setModalUser(null);
      const uRes = await getAllUsers();
      setUsers(uRes.data.data);
    } catch (err) {
      setLoading(false);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalUser(null);
  };

  const onTagToggle = (key, checked) => {
    if (key === "LLM_DASHBOARD") return;
    setPendingKeys((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      width: 30,
      render: (_, r) => `${r.firstName} ${r.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 50,
    },
    {
      title: "Modules",
      dataIndex: "access",
      key: "access",
      width: 300, // adjust as needed
      render: (access) => (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          {access.map((k) => {
            const mod = modules.find((m) => m.key === k);
            return (
              <span
                key={k}
                style={{
                  backgroundColor: "gray",
                  cursor: "auto",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
                title={mod?.name || k}
              >
                {mod?.name || k}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => openModal(record)}
          size="small"
          style={{
            backgroundColor: "#ffc107",
            borderColor: "#ffc107",
            color: "#000",
          }}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mb-0" style={{ color: "#4a4a4a" }}>
          Access Manager
        </h6>
      </div>{" "}
      <div className="table-wrapper dragscroll mt-20">
        {/* new flex wrapper */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "10px",
            paddingRight: "16px", // match your gutter
          }}
        >
          <input
            id="name"
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
            style={{
              width: "240px",
              height: "54px",
              marginRight: filters.name ? "-32px" : 0,
              cursor: "auto",
            }}
          />

          {filters.name && (
            <span
              onClick={() => setFilters((prev) => ({ ...prev, name: "" }))}
              style={{
                cursor: "pointer",
                position: "relative",
                left: "7px",
                paddingBottom: "4px",
              }}
            >
              <Icon
                icon="mdi:close-circle"
                style={{ fontSize: 16, color: "#999" }}
              />
            </span>
          )}
        </div>

        <div className="mt-10">
          <Table
            className="custom-table"
            rowKey="_id"
            dataSource={users}
            columns={columns}
            pagination={false}
            bordered
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
      {/* // blue theme */}
      {/* <div className="new-model">
        <Modal
          size="xl"
          show={!!modalUser}
          onHide={handleCancel}
          centered
          style={{
            "--bs-modal-width": "800px",
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "1rem", fontWeight: "500" }}>
              Access Management
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: "1rem" }}>
            <div
              className="d-flex flex-wrap gap-3 mt-2"
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              {modules.map((m) => {
                const checked = pendingKeys.includes(m.key);
                const isDashboard = m.key === "DASHBOARD";
                return (
                  <Badge
                    key={m.key}
                    pill
                    bg={checked ? "primary" : "secondary"}
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      cursor: isDashboard ? "not-allowed" : "pointer",
                      userSelect: "none",
                      opacity: isDashboard ? 0.6 : 1,
                      minWidth: "120px",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      border: checked
                        ? "2px solid #0d6efd"
                        : "2px solid transparent",
                      transform:
                        !isDashboard && checked ? "scale(1.05)" : "scale(1)",
                      boxShadow: checked
                        ? "0 2px 8px rgba(13, 110, 253, 0.3)"
                        : "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => !isDashboard && onTagToggle(m.key, !checked)}
                    onMouseEnter={(e) => {
                      if (!isDashboard) {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDashboard) {
                        e.target.style.transform = checked
                          ? "scale(1.05)"
                          : "scale(1)";
                        e.target.style.boxShadow = checked
                          ? "0 2px 8px rgba(13, 110, 253, 0.3)"
                          : "0 1px 3px rgba(0,0,0,0.1)";
                      }
                    }}
                  >
                    {m.name}
                    {isDashboard && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem" }}>
                        (Required)
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#e3f2fd",
                borderRadius: "6px",
                borderLeft: "4px solid #2196f3",
              }}
            >
              <small style={{ color: "#1976d2", fontWeight: "500" }}>
                💡 Click on modules to toggle access. Dashboard access is
                required for all users.
              </small>
            </div>
          </Modal.Body>

          <Modal.Footer style={{ padding: "1.5rem 2rem", gap: "12px" }}>
            <Button
              variant="secondary"
              onClick={handleCancel}
              style={{
                padding: "10px 24px",
                fontWeight: "500",
                borderRadius: "6px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOk}
              style={{
                padding: "10px 24px",
                fontWeight: "500",
                borderRadius: "6px",
                backgroundColor: "#0d6efd",
                border: "none",
              }}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div> */}
      {/* yellow theme */}
      <div className="new-model">
        <Modal
          size="xl"
          show={!!modalUser}
          onHide={handleCancel}
          centered
          style={{
            "--bs-modal-width": "800px",
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "1.5rem", fontWeight: "600" }}>
              Access Management
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: "2rem" }}>
            <div
              className="d-flex flex-wrap gap-3 mt-2"
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              {modules.map((m) => {
                const checked = pendingKeys.includes(m.key);
                const isDashboard = m.key === "LLM_DASHBOARD";
                return (
                  <Badge
                    key={m.key}
                    bg={checked ? "warning" : "secondary"}
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      cursor: isDashboard ? "not-allowed" : "pointer",
                      userSelect: "none",
                      opacity: isDashboard ? 0.6 : 1,
                      minWidth: "120px",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      border: checked
                        ? "2px solid #ffc107"
                        : "2px solid transparent",
                      transform:
                        !isDashboard && checked ? "scale(1.05)" : "scale(1)",
                      boxShadow: checked
                        ? "0 2px 8px rgba(255, 193, 7, 0.4)"
                        : "0 1px 3px rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                      color: checked ? "#000" : "#fff",
                    }}
                    onClick={() => !isDashboard && onTagToggle(m.key, !checked)}
                    onMouseEnter={(e) => {
                      if (!isDashboard) {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDashboard) {
                        e.target.style.transform = checked
                          ? "scale(1.05)"
                          : "scale(1)";
                        e.target.style.boxShadow = checked
                          ? "0 2px 8px rgba(255, 193, 7, 0.4)"
                          : "0 1px 3px rgba(0,0,0,0.1)";
                      }
                    }}
                  >
                    {m.name}
                    {isDashboard && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem" }}>
                        (Required)
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#fff3cd",
                borderRadius: "4px",
                borderLeft: "4px solid #ffc107",
              }}
            >
              <small style={{ color: "#856404", fontWeight: "500" }}>
                💡 Click on modules to toggle access. Dashboard access is
                required for all users.
              </small>
            </div>
          </Modal.Body>

          <Modal.Footer style={{ padding: "1.5rem 2rem", gap: "12px" }}>
            <Button
              variant="secondary"
              onClick={handleCancel}
              style={{
                padding: "10px 24px",
                fontWeight: "500",
                borderRadius: "4px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOk}
              style={{
                padding: "10px 24px",
                fontWeight: "500",
                borderRadius: "4px",
                backgroundColor: "#ffc107",
                border: "none",
                color: "#000",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
