import React, { useEffect, useState } from "react";

const EditProject = ({ isOpen, onClose, onSubmit, editingProject }) => {
  const [projectName, setProjectName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [target, setTarget] = useState("");
  const [frequency, setFrequency] = useState("");
  const [status, setStatus] = useState(true);
  const [competitors, setCompetitors] = useState([
    { brand: "", domain: "" },
    { brand: "", domain: "" },
    { brand: "", domain: "" },
  ]);
  const [llmTypes, setLLMTypes] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setProjectName(editingProject.name || "");
      setBrandName(editingProject.brand || "");
      setTarget(editingProject.target || "");
      setFrequency(editingProject.frequency || "");
      setStatus(editingProject.is_active ?? true);
      setCompetitors(editingProject.competitors || [
        { brand: "", domain: "" },
        { brand: "", domain: "" },
        { brand: "", domain: "" },
      ]);
      setLLMTypes(editingProject.type || []);
    } else {
      setProjectName("");
      setBrandName("");
      setTarget("");
      setFrequency("");
      setStatus(true);
      setCompetitors([
        { brand: "", domain: "" },
        { brand: "", domain: "" },
        { brand: "", domain: "" },
      ]);
      setLLMTypes([]);
    }
    setError("");
  }, [editingProject, isOpen]);

  const handleCompetitorChange = (index, field, value) => {
    const updated = [...competitors];
    updated[index][field] = value;
    setCompetitors(updated);
  };

  const handleLlmToggle = (type) => {
    setLLMTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!projectName || !target || !frequency || competitors.some(c => !c.brand || !c.domain)) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload = {
      name: projectName,
      brand: brandName,
      target,
      frequency,
      competitors,
      type: llmTypes,
      is_active: status,
    };

    onSubmit(payload);
  };

  console.log(frequency, "frequency")

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
                <label style={{ fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Brand Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Brand name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
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
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
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

            {/* Competitors */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                Competitors <span style={{ color: "red" }}></span>
              </label>
              {competitors.map((comp, index) => (
                <div key={index} style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    placeholder={`Competitor ${index + 1} Brand`}
                    value={comp.brand}
                    onChange={(e) => handleCompetitorChange(index, "brand", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ced4da",
                      fontSize: "14px",
                    }}
                  />
                  <input
                    type="text"
                    placeholder={`Competitor ${index + 1} Domain`}
                    value={comp.domain}
                    onChange={(e) => handleCompetitorChange(index, "domain", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ced4da",
                      fontSize: "14px",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Row 3: LLM Platforms + Status */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  LLM Platforms <span style={{ color: "red" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {["chatgpt", "gemini", "claude", "perplexity", "ai_overview"].map((type) => (
                    <label key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={llmTypes.includes(type)}
                        onChange={() => handleLlmToggle(type)}
                        style={{
                          cursor: "pointer", width: "16px",
                          height: "16px", accentColor: "#007bff",
                          appearance: "auto",
                        }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Status <span style={{ color: "red" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={status === true}
                      onChange={() => setStatus(true)}
                      disabled={submitting}
                      style={{
                        cursor: "pointer",
                        appearance: "auto",
                      }}
                    />
                    Active
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={status === false}
                      onChange={() => setStatus(false)}
                      disabled={submitting}
                      style={{
                        cursor: "pointer",
                        appearance: "auto",
                      }}
                    />
                    Inactive
                  </label>
                </div>
              </div>
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

export default EditProject;