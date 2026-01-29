import React, { useContext, useEffect, useState } from "react";
import { DatePicker, Typography, Spin } from "antd";

import {
  deleteAllRankProject,
  deleteTrafficProject,
  getAllRankKeywords,
  runAllRank,
} from "../../services/api";
import moment from "moment";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { showToast } from "../../lib/CustomToast";
import { Icon } from "@iconify/react";
import { ToastContainer } from "react-toastify";

const { Text } = Typography;

const AllRank = () => {
  const [target, setTarget] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState();
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
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
        ...(filter.target?.trim() && { target: filter.target.trim() }),
        ...(filter.dateRange?.length === 2 && {
          startDate: moment(filter.startDate).format("YYYY-MM-DD"),
          endDate: moment(filter.startDate).format("YYYY-MM-DD"),
        }),
      };
      const target = await getAllRankKeywords(filteredQuery);
      setTarget(target.data.target);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (record) => {
    setDeleteModalOpen(true);
    setDeleteRecord(record);
  };

  const confirmDelete = async () => {
    try {
      await deleteAllRankProject(deleteRecord._id);
      showToast("Project deleted successfully!", "success");
      setDeleteModalOpen(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete project",
        "error"
      );
    }
  };

  const handleRun = async (id) => {
    setRunLoading(true);
    await runAllRank(id);
    try {
    } catch (e) {
      console.log(e.message);
    } finally {
      setRunLoading(false);
    }
  };

  const resetFilter = () => {
    setFilter({ target: "", startDate: "", endDate: "" });
  };

  useEffect(() => {
    fetchKeywords();
  }, [filter, refresh]);

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
          <h6 className="mb-0">Rank Tracker</h6>
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
          Back
        </button>
      </div>
      <div className="filter-section mt-12">
        <div className="row g-3">
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
                name="target"
                value={filter?.target}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, target: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="col-md-5">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={filter.startDate}
              onChange={(e) =>
                setFilter({ ...filter, startDate: e.target.value })
              }
            />
          </div>

          <div className="col-md-5">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={filter.endDate}
              onChange={(e) =>
                setFilter({ ...filter, endDate: e.target.value })
              }
            />
          </div>

          <div className="col-md-2 d-flex align-items-end">
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

      <div className="card basic-data-table mt-20">
        <div className="card-body">
          <table className="table bordered-table mb-0" data-page-length="10">
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
                  <td colSpan={7} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : target.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No records found
                  </td>
                </tr>
              ) : (
                target?.map((proj, idx) => (
                  <tr key={proj._id}>
                    <td>{idx + 1}</td>
                    <td>{proj.name}</td>
                    <td>{moment(proj.created_at).format("DD MMM YYYY")}</td>
                    <td className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/all-rank-report/${proj._id}`)}
                        title="Click to view data"
                      >
                        <Icon icon="lucide:eye" width="16" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(proj)}
                        title="Click to delete data"
                      >
                        <Icon icon="lucide:trash-2" width="16" />
                      </button>

                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleRun(proj._id)}
                        title="Click to run data"
                      >
                        <Icon icon="lucide:play-circle" width="16" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          project={deleteRecord}
        />
      )}
    </div>
  );
};

export default AllRank;
