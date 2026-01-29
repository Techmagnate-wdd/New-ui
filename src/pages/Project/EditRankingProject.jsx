import React, { useState, useEffect } from "react";
import { Form, Spin } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import LocationSelect from "../../components/LocationSelect";
import { toast } from "react-toastify";
import { showToast } from "../../lib/CustomToast";

const domainPattern =
  "^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\." +
  "(?:[A-Za-z0-9-]{1,63}\\.)*" +
  "[A-Za-z]{2,}$";

const appIdPattern = "^[A-Za-z0-9._]+$";

const isValidDomain = (val) =>
  new RegExp(domainPattern).test(val);

const isValidAppId = (val) =>
  new RegExp(appIdPattern).test(val);

const SERP_FEATURES = [
  { key: "organic", label: "Organic Results" },
  { key: "featured_snippet", label: "Featured Snippet" },
  { key: "app_pack", label: "App Pack" },
  { key: "people_also_ask", label: "People Also Ask" },
  { key: "ai_overview", label: "AI Overview" },
  { key: "images", label: "Images" },
  { key: "local_pack", label: "Local Pack" },
  { key: "top_stories", label: "Top Stories" },
  { key: "short_videos", label: "Short Videos" },
  { key: "discussions_forums", label: "Discussions & Forums" },
  { key: "videos", label: "Videos" },
  { key: "shopping", label: "Shopping" },
];

const EditRankingProject = ({ isOpen, onClose, onSubmit, editingProject }) => {
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const frequencies = ["Daily", "Weekly", "Monthly", "Once", "None"];
  const deviceType = ["Desktop", "Mobile"];
  const [sameAsOrganic, setSameAsOrganic] = useState({});
  const [competitorErrors, setCompetitorErrors] = useState({});
  const [serpCompetitors, setSerpCompetitors] = useState(() => {
    const obj = {};
    SERP_FEATURES.forEach(f => (obj[f.key] = []));
    return obj;
  });
  const [openFeature, setOpenFeature] = useState("organic");
  const [formData, setFormData] = useState({
    project_name: "",
    project_url: "",
    language: "",
    country: "",
    location: "",
    frequency: "",
    device_type: "",
  });
  const isValid = new RegExp(domainPattern).test(formData?.project_url);
  const [form] = Form.useForm();
  const [projectName, setProjectName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setProjectName(editingProject.project_name || "");
      setDomainName(editingProject.project_url || "");
      setTarget(editingProject.target || "");
      setFrequency(editingProject.frequency || "");
      setStatus(editingProject.is_active ?? true);

      setSerpCompetitors(
        editingProject.competitors ||
        SERP_FEATURES.reduce((acc, f) => {
          acc[f.key] = [];
          return acc;
        }, {})
      );
    } else {
      setProjectName("");
      setDomainName("");
      setTarget("");
      setFrequency("");
      setStatus(true);

      setSerpCompetitors(
        SERP_FEATURES.reduce((acc, f) => {
          acc[f.key] = [];
          return acc;
        }, {})
      );
    }
    setError("");
  }, [editingProject, isOpen]);


  const handleSerpCompetitorChange = (feature, index, field, value) => {
    setSerpCompetitors(prev => {
      const updated = { ...prev };
      updated[feature][index][field] = value;
      return updated;
    });

    // validation
    setCompetitorErrors(prev => {
      const next = { ...prev };

      if (!next[feature]) next[feature] = {};
      if (!next[feature][index]) next[feature][index] = {};

      if (field === "domain") {
        next[feature][index].domain =
          value && !isValidDomain(value) ? "Invalid domain" : "";
      }

      if (field === "app_id") {
        next[feature][index].app_id =
          value && !isValidAppId(value) ? "Invalid App ID" : "";
      }

      return next;
    });
  };

  const toggleSameAsOrganic = (feature) => {
    setSameAsOrganic(prev => {
      const enabled = !prev[feature];

      if (enabled) {
        setSerpCompetitors(s => ({
          ...s,
          [feature]: s.organic.map(o => ({
            brand: o.brand,
            domain: feature === "app_pack" ? "" : o.domain,
            app_id: feature === "app_pack" ? "" : undefined
          }))
        }));
      }

      return { ...prev, [feature]: enabled };
    });
  };

  const addSerpCompetitor = (feature) => {
    setSerpCompetitors(prev => ({
      ...prev,
      [feature]: [...prev[feature], {}]
    }));
  };

  const removeSerpCompetitor = (feature, index) => {
    setSerpCompetitors(prev => ({
      ...prev,
      [feature]: prev[feature].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const hasErrors = Object.values(competitorErrors).some(f =>
      Object.values(f || {}).some(r => r.domain || r.app_id)
    );

    if (hasErrors) {
      setError("Fix competitor validation errors first");
      return;
    }

    if (!projectName || !domainName || !frequency) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload = {
      project_name: projectName,
      project_url: domainName,
      frequency,
      device_type: formData.device_type,
      competitors: serpCompetitors,
    };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1050,
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}>
        {/* Header */}
        <div style={{
          background: "#007bff",
          color: "#fff",
          padding: "12px 16px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h5 style={{ fontSize: "18px", fontWeight: "600", margin: 0, color: "#fff" }}>
            Edit Project
          </h5>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "14px",
              border: "1px solid #f5c6cb",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Project Name + Brand Name */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Project Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ced4da",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
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
            </div>


            {/* Row 2: Domain + Frequency */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Domain <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Domain"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ced4da",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Frequency <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ced4da",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Once">Once</option>
                  <option value="None">None</option>
                </select>
              </div>

            </div>

            {/* SERP Competitors */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontWeight: 500 }}>SERP Competitors</label>

              {SERP_FEATURES?.map((feature) => (
                <div
                  key={feature.key}
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: 6,
                    marginBottom: 10,
                    overflow: "hidden",
                  }}
                >

                  {/* Header */}
                  <div
                    onClick={() =>
                      setOpenFeature(
                        openFeature === feature.key ? null : feature.key
                      )
                    }
                    style={{
                      padding: "10px 12px",
                      background: "#f8f9fa",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{feature.label}</span>
                    <span>{openFeature === feature.key ? "−" : "+"}</span>
                  </div>

                  {/* Body */}
                  {openFeature === feature.key && (
                    <div style={{ padding: 12 }}>

                      {feature.key !== "organic" && (
                        <label className="form-check-label mb-2 d-block">
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={!!sameAsOrganic[feature.key]}
                            onChange={() => toggleSameAsOrganic(feature.key)}
                          />
                          Same as Organic
                        </label>
                      )}

                      {serpCompetitors[feature.key].map((comp, index) => (
                        <div
                          className="row mb-2"
                          key={`${feature.key}-${index}`}
                        >
                          {/* Brand */}
                          <div className="col-4">
                            <input
                              className="form-control"
                              placeholder="Brand"
                              disabled={sameAsOrganic[feature.key]}
                              value={comp.brand || ""}
                              onChange={(e) =>
                                handleSerpCompetitorChange(
                                  feature.key,
                                  index,
                                  "brand",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Domain / App ID */}
                          <div className="col-4">
                            {feature.key === "app_pack" ? (
                              <input
                                className="form-control"
                                placeholder="App ID"
                                disabled={sameAsOrganic[feature.key]}
                                value={comp.app_id || ""}
                                onChange={(e) =>
                                  handleSerpCompetitorChange(
                                    feature.key,
                                    index,
                                    "app_id",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              <input
                                className="form-control"
                                placeholder="Domain"
                                disabled={sameAsOrganic[feature.key]}
                                value={comp.domain || ""}
                                onChange={(e) =>
                                  handleSerpCompetitorChange(
                                    feature.key,
                                    index,
                                    "domain",
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </div>

                          {/* Remove */}
                          {!sameAsOrganic[feature.key] && (
                            <div className="col-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm w-100"
                                onClick={() =>
                                  removeSerpCompetitor(feature.key, index)
                                }
                              >
                                Remove
                              </button>
                            </div>
                          )}

                        </div>
                      ))}

                      {!sameAsOrganic[feature.key] && (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => addSerpCompetitor(feature.key)}
                        >
                          + Add Competitor
                        </button>
                      )}

                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              paddingTop: "16px",
              borderTop: "1px solid #dee2e6",
              marginTop: "8px",
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #6c757d",
                  backgroundColor: "#6c757d",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#007bff",
                  color: "white",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {submitting ? "Saving…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRankingProject;