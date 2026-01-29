import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTrafficReport, UploadTargets } from "../../services/api";
import { showToast } from "../../lib/CustomToast";

const UploadTarget = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [formData, setFormData] = useState({
    project_name: "",
    file: "",
  });
  const [targetId, setTargetId] = useState();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (!isExcel) {
      showToast("You can only upload Excel files!", "error");
      return;
    }
    setFileList([file]);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (fileList.length === 0) {
      showToast("Please select a file to upload.", "warning");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("project_name", formData.project_name);
    data.append("file", fileList[0]);

    try {
      const uploadData = await UploadTargets(data);
      const newKeywordId = uploadData.data.newKeyword._id;

      setTargetId(newKeywordId);
      showToast("Target uploaded successfully!", "success");
      setFileList([]);
      setFormData({ file: "", project_name: "" });
    } catch (err) {
      setLoading(false);
      showToast("Failed to upload target. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!targetId) {
      console.log("not valid");
      return;
    }
    (async () => {
      try {
        await createTrafficReport({ target_data: targetId });
      } catch (err) {
        console.error("Failed to create traffic report:", err);
      }
    })();
  }, [targetId]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <span className="me-2" style={{ fontSize: 20 }}>
            🚀
          </span>
          <span style={{ color: "#4f6d86", fontWeight: "bold" }}>
            Upload Targets
          </span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Select Project */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Project Name
              </label>
              <input
                id="project_name"
                placeholder="Enter project name"
                name="project_name"
                type="text"
                className="form-control"
                value={formData?.project_name}
                onChange={(e) =>
                  setFormData({ ...formData, project_name: e.target.value })
                }
              />
            </div>

            
            {/* Upload File */}
            <div className="mb-3">
              <label htmlFor="keywords_file" className="form-label">
                Upload File
                <span
                  className="ms-1"
                  title="Upload your Excel file with keywords to track (.xlsx, .xls)"
                >
                  ℹ️
                </span>
              </label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".xlsx,.xls"
                className="form-control"
                onChange={handleFileChange}
              />
              {fileList[0] && (
                <small className="text-muted">{fileList[0].name}</small>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-8">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Targets"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadTarget;
