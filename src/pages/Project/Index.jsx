import React, { useContext, useEffect, useState, useRef } from "react";
import { Typography, Tooltip, Button } from "antd";
import { ToastContainer } from "react-toastify";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import {
  getProjects,
  blockProject,
  blockLocalProject,
  editRankProjects,
} from "../../services/api";
import { showToast } from "../../lib/CustomToast";
import ChangeProjectStatus from "./ChangeProjectStatus";
import { Icon } from "@iconify/react/dist/iconify.js";
import moment from "moment";
import { Spinner } from "react-bootstrap";
import EditRankingProject from "./EditRankingProject";

const { Title } = Typography;

const ProjectIndex = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id;

  const [editProjectModelOpen, setEditProjectModelOpen] = useState(false);
  const tableRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectModelOpen, setProjectModelOpen] = useState(false);
  const [projectModelOpenn, setProjectModelOpenn] = useState(false);
  const [blockingProject, setBlockingProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [projectDeleteModelOpen, setProjectDeleteModelOpen] = useState(false);


  useEffect(() => {
    fetchProjects();
  }, [userId, refresh]);

  // useEffect(() => {
  //   if (!loading && projects.length) {
  //     $("#projectTable").DataTable({
  //       destroy: true,
  //       pageLength: 10,
  //     });
  //   }
  // }, [loading, projects]);

  useEffect(() => {
    if (!loading && projects.length && tableRef.current) {
      const table = $(tableRef.current).DataTable({
        pageLength: 10,
        destroy: true,
      });

      return () => {
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
          table.destroy(true);
        }
      };
    }
  }, [loading, projects]);


  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects({ user: userId });
      setProjects(res.data.projects || []);
    } catch (err) {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmBlock = async (projectId) => {
    try {
      const res = await blockProject(projectId);
      showToast(res.data.message, "success");
      setProjectModelOpen(false);
      setRefresh((prev) => !prev);
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleProjectStatus = async (record) => {
    setBlockingProject(record);
    setProjectModelOpen(true);
  };
  const handleEdit = (proj) => {
    setEditingProject(proj);
    setProjectModelOpenn(true);
  };

  const handleProjectSubmit = async (payload) => {
    try {
      await editRankProjects(editingProject._id, payload);
      showToast("Project updated successfully!", "success");

      setProjectModelOpen(false);
      setEditingProject(null);
      fetchProjects();

    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to update project", "error");
    }
  };

  return (
    <>
      <div className="project-dashboard">
        <div className="card basic-data-table">
          <div className="card-header">
            <h5 className="card-title mb-0">Projects</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div
                style={{
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spinner size="large" tip="Loading projects..." />
              </div>
            ) : (
              <table
                id="projectTable"
                className="table bordered-table mb-0"
                data-page-length="10"
              >
                <thead>
                  <tr>
                    <th>S.L</th>
                    <th>Project Name</th>
                    <th>Domain</th>
                    <th># Keywords</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((proj, idx) => (
                    <tr key={proj._id}>
                      <td>{idx + 1}</td>
                      <td>{proj.project_name}</td>
                      <td>{proj.project_url}</td>
                      <td>{proj.totalKeywords}</td>
                      <td>
                        <span
                          className={`badge badge-pill ${proj.status ? "badge-success" : "badge-danger"
                            } status-tag`}
                          data-id={proj._id}
                          style={{ cursor: "pointer" }}
                        >
                          {proj.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{moment(proj.created_at).format("DD MMM YYYY")}</td>
                      <td style={{ display: "flex" }}>
                        <Tooltip>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => handleEdit(proj)}
                            style={{ display: "flex", alignItems: "center", padding: 4 }}
                          >
                            <Icon
                              icon="mdi:pencil-outline"
                              style={{ fontSize: 18, color: "#1890ff" }}
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip onClick={() => handleProjectStatus(proj)}>
                          <Link
                            to="#"
                            className="w-32-px h-32-px me-8  text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          >
                            <Icon icon="mingcute:delete-2-line" />
                          </Link>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <ChangeProjectStatus
          show={projectModelOpen}
          handleClose={() => setProjectModelOpen(false)}
          handleSave={confirmBlock}
          task={blockingProject}
        />

        {projectModelOpenn && (
          <div>
            <EditRankingProject
              isOpen={projectModelOpenn}
              onClose={() => {
                setProjectModelOpenn(false);
                setEditingProject(null);
              }}
              editingProject={editingProject}
              onSubmit={handleProjectSubmit}
            />
          </div>
        )}
      </div >
    </>
  );
};

export default ProjectIndex;