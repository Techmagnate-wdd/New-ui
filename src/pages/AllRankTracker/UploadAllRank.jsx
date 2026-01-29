import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAllRankReport, UploadAllRankKeywords } from "../../services/api";
import { showToast } from "../../lib/CustomToast";

const domainPattern =
  "^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\." + // first label
  "(?:[A-Za-z0-9-]{1,63}\\.)*" + // optional middle labels
  "[A-Za-z]{2,}$";

const UploadAllRank = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [touched, setTouched] = useState(false);
  const deviceType = ["Desktop", "Mobile"];
  const [formData, setFormData] = useState({
    project_name: "",
    target: "",
    file: "",
    device_type: "desktop", // Default device type
  });
  const isValid = new RegExp(domainPattern).test(formData?.target);
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
    data.append("target", formData.target);
    data.append("file", fileList[0]);
    data.append("device_type", formData.device_type);

    try {
      const uploadData = await UploadAllRankKeywords(data);
      const newKeywordId = uploadData.data.newKeyword._id;

      setTargetId(newKeywordId);
      showToast("Target uploaded successfully!", "success");
      setFileList([]);
      setFormData({ file: "", project_name: "", target: "", device_type: "" });
    } catch (err) {
      showToast("Failed to upload target. Please try again.", "error");
      setLoading(false);
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
        await createAllRankReport({ target_data: targetId });
      } catch (err) {
        console.error("Failed to create All Rank report:", err);
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

            <div className="mb-3">
              <label htmlFor="target" className="form-label">
                Target (domain only)
              </label>
              <input
                id="target"
                name="target"
                type="text"
                placeholder="example.com"
                className={
                  "form-control " +
                  (touched ? (isValid ? "is-valid" : "is-invalid") : "")
                }
                pattern={domainPattern}
                required
                value={formData?.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                onBlur={() => setTouched(true)}
              />
              <div className="invalid-feedback">
                Please enter a valid domain (e.g. <em>example.com</em>).
              </div>
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

            <div className="mb-3">
              <label htmlFor="device_type" className="form-label">
                Device Type
              </label>
              <select
                id="device_type"
                name="device_type"
                className="form-select"
                value={formData?.device_type}
                onChange={(e) =>
                  setFormData({ ...formData, device_type: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Device Type
                </option>
                {deviceType?.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
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

export default UploadAllRank;
