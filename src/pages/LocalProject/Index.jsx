import React, { useContext, useEffect, useState } from "react";
import { Typography, Tooltip,Button } from "antd";

import { ToastContainer } from "react-toastify";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import {
  blockLocalProject,
  blockProject,
  getLocalProjects,
 editLocalRankProjects
} from "../../services/api";
import { showToast } from "../../lib/CustomToast";
import { Icon } from "@iconify/react/dist/iconify.js";
import moment from "moment";
import ChangeLocalProjectStatus from "./ChangeLocalProjectStatus";
import { Spinner } from "react-bootstrap";
import EditLocalProjectAwasthi from "./EditLocalProjectAwasthi";

const ProjectIndex = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.data?.user?._id;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [projectModelOpen, setProjectModelOpen] = useState(false);
  const [blockingProject, setBlockingProject] = useState(null);
     const [projectModelOpenn, setProjectModelOpennn] = useState(false);
      const [editingProject, setEditingProject] = useState(null);
        // const [editingProject, setEditingProject] = useState(null);
      
  

  useEffect(() => {
    fetchProjects();
  }, [userId, refresh]);

  useEffect(() => {
    if (!loading && projects.length) {
      $("#projectTable").DataTable({
        destroy: true,
        pageLength: 10,
      });
    }
  }, [loading, projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getLocalProjects({ user: userId });
      setProjects(res.data.projects || []);
    } catch (err) {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmBlock = async (projectId) => {
    try {
      const res = await blockLocalProject(projectId);
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


 // --------------------------------- by awasthi ------------
   const handleEdit = (projects) => {
    // alert("done")
    setEditingProject(projects);
    setProjectModelOpennn(true);
  
   
  };

   const handleProjectSubmit = async (payload) => {
        try {
          await editLocalRankProjects(editingProject._id, payload);
          showToast("Project updated successfully!", "success");
    
          setProjectModelOpen(false);
          setEditingProject(null);
    
          // refresh projects
          // fetchProjects(filters);
             fetchProjects();
        
        } catch (error) {
          showToast(error?.response?.data?.message || "Failed to update project", "error");
        }
      };
  



  return (
    <div className="project-dashboard">
      <div className="card basic-data-table">
        <div className="card-header">
          <h5 className="card-title mb-0">Projects</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <Spinner size="large" />
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
                        className={`status-tag badge-pill ${proj.status ? "badge-success" : "badge-danger"
                          }`}
                        data-id={proj._id}
                        style={{ cursor: "pointer" }}
                      >
                        {proj.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{moment(proj.created_at).format("DD MMM YYYY")}</td>
                 <td style={{ display: "flex", gap: "10px" }}>


                      {/* <Tooltip>
                      <span
                        onClick={() => handleProjectStatus(proj)}
                        className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                      >
                        <Icon icon="lucide:edit" />
                      </span>
                    </Tooltip> */}




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
                          className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
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

      {projectModelOpen && (
        <ChangeLocalProjectStatus
          show={projectModelOpen}
          handleClose={() => setProjectModelOpen(false)}
          handleSave={confirmBlock}
          task={blockingProject}
        />
      )}

       {projectModelOpenn && (
            <div>
              <EditLocalProjectAwasthi
                isOpen={projectModelOpenn}
                onClose={() => {
                  setProjectModelOpennn(false);
                  setEditingProject(null);
                }}
                editingProject={editingProject}
                onSubmit={handleProjectSubmit}
              />
            </div>
          )}
    </div>
  );
};

export default ProjectIndex;
