import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { showToast } from "../../lib/CustomToast";
import { Icon } from "@iconify/react";
import $ from "jquery";
import { deleteTrafficProject, getTarget } from "../../services/api";

const TrafficIndex = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.data?.user?._id;

  const [target, setTarget] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const navigate = useNavigate();

  const [filter, setFilter] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const fetchTarget = async () => {
    setLoading(true);
    try {
      const query = {
        ...(filter.name && { name: filter.name.trim() }),
        ...(filter.startDate && { startDate: filter.startDate }),
        ...(filter.endDate && { endDate: filter.endDate }),
      };
      const res = await getTarget(query);
      setTarget(res.data.target || []);
    } catch (err) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarget();
  }, [filter, refresh]);

  useEffect(() => {
    if (!loading && target.length) {
      $("#trafficTable").DataTable({
        destroy: true,
        pageLength: 10,
      });
    }
  }, [loading, target]);

  const handleDelete = (record) => {
    setDeleteRecord(record);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTrafficProject(deleteRecord._id);
      setDeleteModalOpen(false);
      showToast("Project deleted successfully!", "success");
      setRefresh((p) => !p);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete project",
        "error"
      );
    }
  };

  const resetFilter = () => {
    setFilter({ name: "", startDate: "", endDate: "" });
  };

  return (
    <div className="project-dashboard">
      <div className="card-header">
        <h6 className="mb-0">Traffic Analysis</h6>
      </div>
      <div className="filter-section mt-12">
        <div className="row g-3">
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
          <table
            className="table bordered-table mb-0"
            data-page-length="10"
            // id="trafficTable"
          >
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
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/traffic-report/${proj._id}`)}
                      >
                        <Icon icon="lucide:eye" width="16" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(proj)}
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

export default TrafficIndex;
