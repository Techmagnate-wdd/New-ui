import React, { useState, useEffect, useRef, useContext } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
  getCountries,
  getLanguageCodes,
  getLocations,
  UploadLLMModeKeywords,
} from "../../services/api";
import { showToast } from "../../lib/CustomToast";
import LocationSelect from "../../components/LocationSelect";
import FileFormatReference from "../../components/FileFormatReference";
import AuthContext from "../../context/AuthContext";


const sampleDataColumns = ["Keywords"];

const sampleData = [
  {
    Keywords: "keyword1",
  },
  {
    Keywords: "keyword2",
  },
];

const initialFormData = {
  project_name: "",
  brand: "",
  target_name: "",
  frequency: "None",
  llm_type: [],
  language: "",
  country: "",
  location: "",
  competitors: [
    { brand: "", domain: "" },
    { brand: "", domain: "" },
    { brand: "", domain: "" }
  ]
};

const UploadLLMKeywords = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [formData, setFormData] = useState(initialFormData)
  const fileInputRef = useRef(null);
  const [targetId, setTargetId] = useState("");
  const [locationCodes, setLocationCodes] = useState([]);
  const [currentCountry, setCurrentCountry] = useState("");
  const [languageCodes, setLanguageCodes] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const frequencies = ["Daily", "Weekly", "Monthly", "Once", "None"];
  const { user } = useContext(AuthContext);

  const llmOptions = [
    { value: "chatgpt", label: "ChatGPT" },
    { value: "gemini", label: "Gemini" },
    { value: "perplexity", label: "Perplexity" },
    { value: "claude", label: "Claude" },
    { value: "ai_overview", label: "AI Mode" },
  ];

  const handleCompetitorChange = (index, field, value) => {
    const updated = [...formData.competitors];
    updated[index][field] = value;
    setFormData({ ...formData, competitors: updated });
  };

  const handleFileChange = (e) => {
    console.log(e.target, "e.target")
    const file = e.target.files[0];
    if (!file) {
      setFileList([]);
      return;
    };

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

  useEffect(() => {
    (async () => {
      try {
        const [{ data: langs }, { data: countries }] = await Promise.all([
          getLanguageCodes(),
          getCountries(),
        ]);
        setLanguageCodes(langs.tasks);
        setCountryCodes(countries.tasks);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const fetchLocations = async (query, countryCode) => {
    try {
      const response = await getLocations(query, countryCode);
      let data = response.data.results.map((loc) => ({
        value: loc.location_code,
        label: `${loc.location_name} (${loc.location_code})`,
      }));
      setCurrentCountry(countryCode);
      setLocationCodes(data);
    } catch (error) {
      console.error("Failed to fetch language codes:", error);
    }
  };

  const handleCountryChange = async (e) => {
    const selectedCountry = e.target.value;

    setFormData((prev) => ({
      ...prev,
      country: selectedCountry,
    }));

    setLoading(true);
    await fetchLocations("", selectedCountry);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.project_name ||
      !formData.brand ||
      !formData.target_name ||
      !formData.frequency ||
      !formData.llm_type ||
      !formData.location ||
      !formData.language ||
      !formData.country
    ) {
      showToast("Please fill in all fields.", "warning");
      return;
    }
    if (fileList.length === 0) {
      showToast("Please select a file to upload.", "warning");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("name", formData.project_name);
    data.append("brand", formData.brand);
    data.append("target", formData.target_name);
    data.append("frequency", formData.frequency);
    data.append("type", JSON.stringify(formData.llm_type));
    data.append("file", fileList[0]);
    data.append("language", formData.language);
    data.append("country", formData.country);
    data.append("location", formData.location);
    data.append("competitors", JSON.stringify(formData.competitors));
    data.append("userId", user._id);

    try {
      const resp = await UploadLLMModeKeywords(data);

      const project = resp?.data?.project;

      if (!project || !project._id) {
        console.error("Unexpected upload response:", resp?.data);
        showToast("Upload succeeded but server response was unexpected.", "warning");
      } else {
        setTargetId(project._id);
        showToast("Keywords uploaded successfully!", "success");
      }

      // reset form
      setFormData(initialFormData);
      setFileList([]);

      // CLEAR native file input UI
      if (fileInputRef.current) {
        console.log(fileInputRef, "fileInputRef")
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        "Failed to upload keywords. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: "0px auto", padding: "20px" }}>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <span style={{ color: "#4f6d86", fontWeight: "bold" }}>
            Add Project ji
          </span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row gy-3">
              {/* Project Name */}
              <div className="col-6">
                <label htmlFor="project_name" className="form-label">
                  Project Name
                </label>
                <input
                  id="project_name"
                  name="project_name"
                  type="text"
                  className="form-control"
                  placeholder="Enter project name"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Brand Name */}
              <div className="col-6">
                <label htmlFor="project_name" className="form-label">
                  Brand Name
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  className="form-control"
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  required
                />
              </div>

              {/* Competitors */}
              <div className="col-12">
                <label className="form-label">Competitors</label>
                {formData?.competitors?.map((comp, index) => (
                  <div className="row mb-3" key={index}>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Competitor ${index + 1} Brand`}
                        value={comp.brand}
                        onChange={(e) =>
                          handleCompetitorChange(index, "brand", e.target.value)
                        }
                      // required
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Competitor ${index + 1} Domain`}
                        value={comp.domain}
                        onChange={(e) =>
                          handleCompetitorChange(index, "domain", e.target.value)
                        }
                      // required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Target Name */}
              <div className="col-6">
                <label htmlFor="target_name" className="form-label">
                  Brand Domain
                </label>
                <input
                  id="target_name"
                  name="target_name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Q2 Domains"
                  value={formData.target_name}
                  onChange={(e) =>
                    setFormData({ ...formData, target_name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Language */}
              <div className="col-6">
                <label htmlFor="language" className="form-label">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  className="form-select"
                  value={formData?.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Language
                  </option>
                  {languageCodes?.map((lang) => (
                    <option key={lang.language_code} value={lang.language_code}>
                      {lang.language_name} ({lang.language_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div className="col-6">
                <label htmlFor="country" className="form-label">
                  Select Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="form-select"
                  value={formData?.country}
                  onChange={handleCountryChange}
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  {countryCodes.map((c) => (
                    <option key={c.iso2} value={c.iso2}>
                      {c.name} ({c.iso2})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="col-6">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <LocationSelect
                  countryCode={currentCountry}
                  data={locationCodes}
                  value={formData?.location}
                  onChange={(val) =>
                    setFormData({ ...formData, location: val })
                  }
                />
              </div>


              {/* Tracking Frequency */}
              <div className="col-6">
                <label htmlFor="frequency" className="form-label">
                  Tracking Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  className="form-select"
                  value={formData?.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Frequency
                  </option>
                  {frequencies?.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* LLM Type */}
              <div className="col-6 mb-2">
                <label htmlFor="device_type" className="form-label">
                  LLM Type
                </label>
                <Select
                  id="llm_type"
                  name="llm_type"
                  isMulti
                  options={llmOptions}
                  value={llmOptions.filter(opt => formData.llm_type.includes(opt.value))}
                  onChange={(selected) => {
                    if (Array.isArray(selected)) {
                      setFormData(prev => ({ ...prev, llm_type: selected.map(s => s.value) }));
                    } else if (selected === null) {
                      setFormData(prev => ({ ...prev, llm_type: [] }));
                    } else if (selected && typeof selected === "object") {
                      setFormData(prev => ({ ...prev, llm_type: [selected.value] }));
                    } else {
                      setFormData(prev => ({ ...prev, llm_type: [] }));
                    }
                  }}
                  placeholder="Select LLM Platforms..."
                  classNamePrefix="react-select"
                />
              </div>

              {/* File Picker */}
              <div className="col-12">
                <label htmlFor="file" className="form-label">
                  Upload Keywords File
                  <span
                    className="ms-1"
                    title="Upload your Excel file with keywords (.xlsx, .xls)"
                  >
                    ℹ️
                  </span>
                  <span style={{ marginRight: "0px", fontStyle: "italic" }}>
                    <FileFormatReference
                      columns={sampleDataColumns}
                      sampleData={sampleData}
                      fileName="keywords_template.xlsx"
                    />
                  </span>
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".xlsx,.xls"
                  className="form-control"
                  onChange={handleFileChange}
                  ref={fileInputRef} // <- attach ref
                />
                {fileList[0] && (
                  <small className="text-muted">{fileList[0].name}</small>
                )}
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadLLMKeywords;
