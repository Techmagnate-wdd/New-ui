import React, { useState, useEffect, useContext } from "react";
import { Form, Spin } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import LocationSelect from "../../components/LocationSelect";
import {
  createProject,
  getCountries,
  getLanguageCodes,
  getLocations,
} from "../../services/api";
import { toast } from "react-toastify";
import { showToast } from "../../lib/CustomToast";
import AuthContext from "../../context/AuthContext";

const domainPattern =
  "^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\." +
  "(?:[A-Za-z0-9-]{1,63}\\.)*" +
  "[A-Za-z]{2,}$";

const appIdPattern = "^[A-Za-z0-9._]+$"; // com.company.app


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
  { key: "shopping", label: "Shopping" }
];

const Index = () => {
  const [locationCodes, setLocationCodes] = useState([]);
  const [currentCountry, setCurrentCountry] = useState("");
  const [languageCodes, setLanguageCodes] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const frequencies = ["Daily", "Weekly", "Monthly", "Once", "None"];
  const deviceType = ["Desktop", "Mobile"];
  const [touched, setTouched] = useState(false);
  const { user } = useContext(AuthContext);
  const [sameAsOrganic, setSameAsOrganic] = useState({});
  const [competitorErrors, setCompetitorErrors] = useState({});
  const [formData, setFormData] = useState({
    project_name: "",
    project_url: "",
    language: "",
    country: "",
    location: "",
    frequency: "",
    priority: 1,
    device_type: "",
  });
  // const [competitors, setCompetitors] = useState([
  //   { brand: "", domain: "" },
  //   { brand: "", domain: "" },
  //   { brand: "", domain: "" }
  // ]);
  const [serpCompetitors, setSerpCompetitors] = useState(() => {
    const obj = {};
    SERP_FEATURES.forEach(f => {
      obj[f.key] = [];
    });
    return obj;
  });

  const isValid = new RegExp(domainPattern).test(formData?.project_url);
  const [form] = Form.useForm();

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

  const handleSerpCompetitorChange = (feature, index, field, value) => {
    setSerpCompetitors(prev => {
      const updated = { ...prev };
      updated[feature][index][field] = value;
      return updated;
    });

    // validation
    setCompetitorErrors(prev => {
      const copy = { ...prev };

      if (!copy[feature]) copy[feature] = {};
      if (!copy[feature][index]) copy[feature][index] = {};

      if (field === "domain") {
        copy[feature][index].domain =
          value && !isValidDomain(value) ? "Invalid domain" : "";
      }

      if (field === "app_id") {
        copy[feature][index].app_id =
          value && !isValidAppId(value) ? "Invalid App ID" : "";
      }

      return copy;
    });
  };


  const addSerpCompetitor = (feature) => {
    setSerpCompetitors(prev => {
      const updated = { ...prev };

      updated[feature].push({ brand: "", domain: "" });

      // If adding in Organic, replicate everywhere
      if (feature === "organic") {
        SERP_FEATURES.forEach(f => {
          if (f.key !== "organic") {
            updated[f.key] = updated.organic.map(o => ({
              brand: o.brand,
              domain: f.key === "app_pack" ? "" : o.domain,
              app_id: f.key === "app_pack" ? "" : undefined
            }));
          }
        });
      }

      return updated;
    });
  };

  const removeSerpCompetitor = (feature, index) => {
    setSerpCompetitors(prev => {
      const updated = { ...prev };
      updated[feature] = updated[feature].filter((_, i) => i !== index);
      return updated;
    });
  };

  const toggleSameAsOrganic = (feature) => {
    setSameAsOrganic(prev => {
      const next = { ...prev, [feature]: !prev[feature] };

      // if enabling → copy organic
      if (!prev[feature]) {
        setSerpCompetitors(s => ({
          ...s,
          [feature]: s.organic.map(o => ({
            brand: o.brand,
            domain: feature === "app_pack" ? "" : o.domain,
            app_id: feature === "app_pack" ? "" : undefined
          }))
        }));
      }

      return next;
    });
  };

  const isValidDomain = (val) =>
    new RegExp(domainPattern).test(val);

  const isValidAppId = (val) =>
    new RegExp(appIdPattern).test(val);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        serpCompetitors, // 👈 array of { brand, domain }
        userId: user._id
      };
      console.log(payload, "payload")
      await createProject(payload);
      showToast("Project Created Successfully!", "success");
      setFormData({
        project_name: "",
        project_url: "",
        language: "",
        country: "",
        location: "",
        frequency: "",
        priority: 1,
        device_type: "",
      });
      // reset serp competitors
      const reset = {};
      SERP_FEATURES.forEach(f => {
        reset[f.key] = [];
      });
      setSerpCompetitors(
        Object.fromEntries(SERP_FEATURES.map(f => [f.key, []]))
      );
    } catch {
      toast.error("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-md-12">
      <div className="card">
        <div className="card-header">
          <h6 className="card-title mb-0">Add Project</h6>
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

              {/* Domain */}
              <div className="col-6">
                <label htmlFor="project_url" className="form-label">
                  Domain{" "}
                </label>
                <input
                  id="project_url"
                  name="project_url"
                  type="text"
                  placeholder="example.com"
                  className={
                    "form-control " +
                    (touched ? (isValid ? "is-valid" : "is-invalid") : "")
                  }
                  pattern={domainPattern}
                  required
                  value={formData?.project_url}
                  onChange={(e) =>
                    setFormData({ ...formData, project_url: e.target.value })
                  }
                  onBlur={() => setTouched(true)}
                />
                <div className="invalid-feedback">
                  Please enter a valid domain (e.g. <em>example.com</em>).
                </div>
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

              {/* Priority Level */}
              <div className="col-6">
                <label htmlFor="priority" className="form-label">
                  Priority level
                </label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  min={1}
                  max={10}
                  className="form-control"
                  value={formData?.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: Number(e.target.value),
                    })
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

              <div className="col-6">
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

              {/* --------------------------------------------------- */}
              {/* Competitors Section */}
              {/* <div className="col-12">
                <h6 className="mb-1">Competitors</h6>
              </div >

              {
                competitors.map((comp, index) => (
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
                ))
              } */}

              {/* ---------------- SERP Competitors ---------------- */}
              {/* <div className="col-12">
                <h6 className="mb-2">SERP Feature Competitors</h6>

                {SERP_FEATURES.map((feature) => (
                  <div key={feature.key} className="mb-4 border rounded p-3">

                    <h6 className="mb-3">{feature.label}</h6>

                    {serpCompetitors[feature.key].map((comp, index) => (
                      <div className="row mb-2 align-items-center" key={index}>

                        <div className="col-5">
                          <input
                            className="form-control"
                            placeholder="Brand"
                            value={comp.brand}
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

                        <div className="col-5">
                          <input
                            className="form-control"
                            placeholder="Domain"
                            value={comp.domain}
                            onChange={(e) =>
                              handleSerpCompetitorChange(
                                feature.key,
                                index,
                                "domain",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger w-100"
                            onClick={() => removeSerpCompetitor(feature.key, index)}
                          >
                            Remove
                          </button>
                        </div>

                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => addSerpCompetitor(feature.key)}
                    >
                      + Add Competitor
                    </button>

                  </div>
                ))}
              </div> */}
              {/* ---------------- SERP COMPETITORS ---------------- */}
              <div className="col-12">
                <label className="form-label">SERP Competitors</label>

                {SERP_FEATURES.map((feature) => (
                  <div key={feature.key} className="mb-4 border rounded p-3">

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label mb-0">{feature.label}</label>

                      {feature.key !== "organic" && (
                        <label className="form-check-label small">
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={!!sameAsOrganic[feature.key]}
                            onChange={() => toggleSameAsOrganic(feature.key)}
                          />
                          Same as Organic
                        </label>
                      )}
                    </div>

                    {/* Rows */}
                    {serpCompetitors[feature.key].map((comp, index) => (
                      <div className="row mb-2 align-items-center" key={index}>

                        {/* BRAND */}
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

                        {/* DOMAIN or APP ID */}
                        <div className="col-4">
                          {feature.key === "app_pack" ? (
                            <>
                              <input
                                className={`form-control ${competitorErrors?.[feature.key]?.[index]?.app_id
                                  ? "is-invalid"
                                  : ""
                                  }`}
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

                              {competitorErrors?.[feature.key]?.[index]?.app_id && (
                                <div className="invalid-feedback">
                                  {competitorErrors[feature.key][index].app_id}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <input
                                className={`form-control ${competitorErrors?.[feature.key]?.[index]?.domain
                                  ? "is-invalid"
                                  : ""
                                  }`}
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

                              {competitorErrors?.[feature.key]?.[index]?.domain && (
                                <div className="invalid-feedback">
                                  {competitorErrors[feature.key][index].domain}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* REMOVE */}
                        {!sameAsOrganic[feature.key] && (
                          <div className="col-4">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger w-100"
                              onClick={() => removeSerpCompetitor(feature.key, index)}
                            >
                              Remove
                            </button>
                          </div>
                        )}

                      </div>
                    ))}

                    {/* ADD BUTTON */}
                    {!sameAsOrganic[feature.key] && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => addSerpCompetitor(feature.key)}
                      >
                        + Add Competitor
                      </button>
                    )}

                  </div>
                ))}
              </div>


              {/* Submit Button */}
              <div className="col-12">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100"
                >
                  {loading ? (
                    <>
                      <Spin size="small" /> Creating Project...
                    </>
                  ) : (
                    <>
                      <GlobalOutlined /> Submit
                    </>
                  )}
                </button>
              </div>
            </div >
          </form >
        </div >
      </div >
    </div >
  );
};

export default Index;
