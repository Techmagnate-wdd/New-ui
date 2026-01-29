import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLocalProjects, getProjects, UploadKeywords, UploadLocalKeywords } from "../../services/api";
import { DashboardLayout } from "../../components/DashboardLayout";
import { showToast } from "../../lib/CustomToast";
import FileFormatReference from "../../components/FileFormatReference";

const sampleDataColumns = ["Keywords", "Brand", "Category", "SubCategory"];

const sampleData = [
  {
    Keywords: "keyword1",
    Brand: "brand1",
    Category: "category1",
    SubCategory: "subCategory1",
  },
  {
    Keywords: "keyword2",
    Brand: "brand1",
    Category: "category1",
    SubCategory: "subCategory1",
  },
];

const UploadKeyword = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [formData, setFormData] = useState({ project_id: "" });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getLocalProjects();
        setProjects(response.data.projects);
      } catch (error) {
        showToast("Failed to load projects. Please try again.", "error");
      }
    };
    fetchProjects();
  }, []);

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
    e.preventDefault();
    if (!formData.project_id) {
      showToast("Please select a project", "warning");
      return;
    }
    if (fileList.length === 0) {
      showToast("Please select a file to upload.", "warning");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("project_id", formData.project_id);
    data.append("file", fileList[0]);

    try {
      await UploadLocalKeywords(data);
      showToast("Keywords uploaded successfully!", "success");
      setFileList([]);
      setFormData({ project_id: "" });
    } catch (err) {
      showToast("Failed to upload keywords. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <span className="me-2" style={{ fontSize: 20 }}>
            🚀
          </span>
          <span style={{ color: "#4f6d86", fontWeight: "bold" }}>
            Upload Keywords
          </span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Select Project */}
            <div className="mb-3">
              <label htmlFor="project_id" className="form-label">
                Select Project
              </label>
              <select
                id="project_id"
                name="project_id"
                className="form-select"
                value={formData.project_id}
                onChange={(e) =>
                  setFormData({ ...formData, project_id: e.target.value })
                }
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload File */}
            <div className="mb-3 ">
              <label htmlFor="keywords_file" className="form-label mt-15">
                <div>
                  Upload Keywords File
                  <span
                    className="ms-1"
                    title="Upload your Excel file with keywords to track (.xlsx, .xls)"
                  >
                    ℹ️
                  </span>
                </div>
                <div>
                  <span style={{ marginRight: "0px", fontStyle: "italic" }}>
                    <FileFormatReference
                      columns={sampleDataColumns}
                      sampleData={sampleData}
                      fileName="keywords_template.xlsx"
                    />
                  </span>
                </div>
              </label>

              <input
                type="file"
                id="keywords_file"
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
                {loading ? "Uploading..." : "Upload Keywords"}

              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadKeyword;
