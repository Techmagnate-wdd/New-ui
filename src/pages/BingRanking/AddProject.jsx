import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAIModeReport,
  getCountries,
  getLanguageCodes,
  getLocations,
  UploadAppRankKeywords,
  UploadBingRankKeywords,
} from "../../services/api";
import { showToast } from "../../lib/CustomToast";
import LocationSelect from "../../components/LocationSelect";
import FileFormatReference from "../../components/FileFormatReference";

const sampleDataColumns = ["Keywords"];

const sampleData = [
  {
    Keywords: "keyword1",
  },
  {
    Keywords: "keyword2",
  },
];


const AddProjects = () => {
  const navigate = useNavigate();

// -------------------------------------------awasthiai----------------------------
   const [competitors, setCompetitors] = useState([
        { brand: "", domain: "" },
        { brand: "", domain: "" },
        { brand: "", domain: "" }
      ]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [languageCodes, setLanguageCodes] = useState([]);
  const [locationCodes, setLocationCodes] = useState([]);
  const [currentCountry, setCurrentCountry] = useState("");
  const [countryCodes, setCountryCodes] = useState([]);
  const frequencies = ["Daily", "Weekly", "Monthly", "Not Available"];
  const deviceType = ["Desktop", "Mobile"];

  const [formData, setFormData] = useState({
    project_name: "",
    target_name: "",
    language: "",
    country: "",
    location: "",
    frequency: "",
    deviceType: "",
  });
  const [targetId, setTargetId] = useState("");

// -----------------------------awasthi ai-------------------
const handleCompetitorChange = (index, field, value) => {
    setCompetitors((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };




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

    if (
      !formData.project_name ||
      !formData.target_name ||
      !formData.language ||
      !formData.country ||
      !formData.location ||
      !formData.frequency ||
      !formData.deviceType
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
    data.append("target", formData.target_name);
    data.append("language", formData.language);
    data.append("country", formData.country);
    data.append("location", formData.location);
    data.append("frequency", formData.frequency);
    data.append("device", formData.deviceType);
    data.append("file", fileList[0]);


    data.append(
        "competitors",
        JSON.stringify(
          competitors.filter((c) => c.brand || c.domain)
        ))

    try {
      const resp = await UploadBingRankKeywords(data);
      const newId = resp.data.newKeyword._id;
      setTargetId(newId);
      showToast("Keywords uploaded successfully!", "success");

      // reset form
      setFormData({
        project_name: "",
        target_name: "",
        language: "",
        country: "",
        location: "",
        frequency: "",
        deviceType,
      });
      setFileList([]);

      console.log(data)
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

  return (
    <div style={{ margin: "0px auto", padding: "20px" }}>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <span className="me-2" style={{ fontSize: 20 }}>
            🚀
          </span>
          <span style={{ color: "#4f6d86", fontWeight: "bold" }}>
            Create Project
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

              {/* Target Name */}
              <div className="col-6">
                <label htmlFor="target_name" className="form-label">
                  Domain
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
                  <option value="" disabled >
                    Select Frequency
                  </option>
                  {frequencies?.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Api Type */}
              <div className="col-6">
                <label htmlFor="deviceType" className="form-label">
                  Device
                </label>
                <select
                  id="deviceType"
                  name="deviceType"
                  className="form-select"
                  value={formData?.deviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceType: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select API
                  </option>
                  {deviceType?.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Picker */}
              <div className="col-6">
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
                />
                {fileList[0] && (
                  <small className="text-muted">{fileList[0].name}</small>
                )}
              </div>






 {/* --------------------------------------------------- */}
                              {/* Competitors Section */}
                              <div className="col-12">
                                <h6 className="mb-2">Competitors</h6>
                              </div>
                
                              {competitors.map((comp, index) => (
                                <React.Fragment key={index}>
                                  <div className="col-6">
                                    <label className="form-label">
                                      Brand {index + 1}
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Brand name"
                                      value={comp.brand}
                                      onChange={(e) =>
                                        handleCompetitorChange(index, "brand", e.target.value)
                                      }
                                    />
                                  </div>
                
                                  <div className="col-6">
                                    <label className="form-label">
                                      Domain {index + 1}
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="example.com"
                                      value={comp.domain}
                                      onChange={(e) =>
                                        handleCompetitorChange(index, "domain", e.target.value)
                                      }
                                    />
                                  </div>
                                </React.Fragment>
                              ))}
                
                















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
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjects;
