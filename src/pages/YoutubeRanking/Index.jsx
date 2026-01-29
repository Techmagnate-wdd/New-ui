import React, { useContext, useEffect, useState } from "react";
import {
  deleteAllRankProject,
  getAppRankKeywords,
  runAllRank,
} from "../../services/api";
import moment from "moment";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { showToast } from "../../lib/CustomToast";
import { Icon } from "@iconify/react";
import { ToastContainer } from "react-toastify";

const YoutubeRank = () => {
  const [target, setTarget] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState();
  const [refresh, setRefresh] = useState(false);

  const { user } = useContext(AuthContext);
  const userRole = user?.data?.user?.role || "";
  const navigate = useNavigate();

  const [filter, setFilter] = useState({
    target: "",
    startDate: "",
    endDate: "",
  });

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const filteredQuery = {
        ...(filter.target.trim() && { target: filter.target.trim() }),
        ...(filter.startDate &&
          filter.endDate && {
            startDate: filter.startDate,
            endDate: filter.endDate,
          }),
      };
      const res = await getAppRankKeywords(filteredQuery, "allTypes");
      setTarget(res.data.projects);
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [filter, refresh]);

  const resetFilter = () =>
    setFilter({ target: "", startDate: "", endDate: "" });

  const handleDelete = (rec) => {
    setDeleteRecord(rec);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAllRankProject(deleteRecord._id);
      showToast("Project deleted successfully!", "success");
      setDeleteModalOpen(false);
      setRefresh((p) => !p);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to delete project",
        "error"
      );
    }
  };

  const handleRun = async (id) => {
    setRunLoading(true);
    try {
      await runAllRank(id);
      showToast("Run triggered successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to trigger run", "error");
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <div className="project-dashboard container1 py-4">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="card-header">
          <h6 className="mb-0">App Rank</h6>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-12 card shadow-sm mb-4">
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                name="target"
                placeholder="Search by Domain"
                className="form-control"
                value={filter.target}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, target: e.target.value }))
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filter.startDate}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filter.endDate}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>

            <div className="col-md-2 align-items-end">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={resetFilter}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="card basic-data-table mt-20">
        <div className="card-body p-0">
          <table className="table bordered-table mb-0">
            <thead>
              <tr>
                <th>S.L</th>
                <th>Project Name</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : target.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    No records found
                  </td>
                </tr>
              ) : (
                target.map((proj, idx) => (
                  <tr key={proj._id}>
                    <td>{idx + 1}</td>
                    <td>{proj.name}</td>
                    <td>{moment(proj.created_at).format("DD MMM YYYY")}</td>
                    <td className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/ai-mode-report/${proj._id}`)}
                        title="View Report"
                      >
                        <Icon icon="lucide:eye" width="16" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(proj)}
                        title="Delete Project"
                      >
                        <Icon icon="lucide:trash-2" width="16" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {deleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          project={deleteRecord}
        />
      )}

      {/* Toasts */}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default YoutubeRank;
