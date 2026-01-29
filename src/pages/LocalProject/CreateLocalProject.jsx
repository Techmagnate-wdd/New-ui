import React, { useState, useEffect } from "react";
import { Form, Spin } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import LocationSelect from "../../components/LocationSelect";
import {
  createLocalProject,
  createProject,
  getCountries,
  getLanguageCodes,
  getLocations,
} from "../../services/api";
import { toast } from "react-toastify";
import { showToast } from "../../lib/CustomToast";

const domainPattern =
  "^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\." +
  "(?:[A-Za-z0-9-]{1,63}\\.)*" +
  "[A-Za-z]{2,}$";

const Index = () => {
    const [competitors, setCompetitors] = useState([
      { brand: "", domain: "" },
      { brand: "", domain: "" },
      { brand: "", domain: "" }
    ]);
  const [locationCodes, setLocationCodes] = useState([]);
  const [languageCodes, setLanguageCodes] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [currentCountry, setCurrentCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const frequencies = ["Daily", "Weekly", "Monthly"];
  const deviceType = ["Desktop", "Mobile"];
  const [touched, setTouched] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
 const payload = {
        ...formData,
        competitors, // 👈 array of { brand, domain }
      };


      
      await createLocalProject(payload);
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

       setCompetitors([
        { brand: "", domain: "" },
        { brand: "", domain: "" },
        { brand: "", domain: "" },
      ]);



      // console.log("done")
    } catch {
      toast.error("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };





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

              {/* Project Url */}
              {/* <div className="col-6">
                <label htmlFor="project_url" className="form-label">
                  Domain
                </label>
                <input
                  type="text"
                  id="project_url"
                  name="project_url"
                  placeholder="https://example.com"
                  className="form-control"
                  value={formData?.project_url}
                  onChange={(e) =>
                    setFormData({ ...formData, project_url: e.target.value })
                  }
                />
              </div> */}

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

              {/* Device Type */}
              <div className="col-6">
                <label htmlFor="device_type" className="form-label">
                  Select Device Type
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
