import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// const AIRTABLE_BASE_ID = "app2OgbrWiCyoo9iV";
const AIRTABLE_BASE_ID = "appSCTuMYLkwTrrsO";

// const AIRTABLE_API_KEY =
//   process.env.REACT_APP_AIRTABLE_PAT ||
//   "pat8C4yWP1cARdZVA.f22fb26c9a77e75b85753c73f59e24be00c28d1fd729979f0ae8ff8de65efb30";

  const AIRTABLE_API_KEY =
  process.env.REACT_APP_AIRTABLE_PAT ||
  "patTPprb6TrWDNzkF.b6eeaf3be294934927c52416556bbfed1ac749503d57e730f10ee9295e17d89f";
  

// Function to map tableId to the respective Airtable table ID
const getTableId = (id) => {
  switch (id) {
    case "1":
      return "tblCTLCTSRDfZy3OA"; // Table 1 Airtable ID
    case "2":
      return "tblqMQ1wNrUSfh4fD"; // Table 2 Airtable ID
    case "3":
      return "tbl93cY7AmpncONeK"; // Table 3 Airtable ID
    case "4":
      return "tblmTcKzVNuRB36UO"; // Table 4 Airtable ID
    default:
      return "tblCTLCTSRDfZy3OA"; // Default to Table 1
  }
};

const AirtableTablePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  const { tableId } = useParams();

  console.log(tableId,"tableId")

  useEffect(() => {
    loadProjectData();
  }, [tableId]); // Re-fetch data when tableId changes

  const user = JSON.parse(localStorage.getItem("internalUser"));

  const loadProjectData = async () => {
    setLoading(true);
    const AIRTABLE_TABLE_ID = getTableId(tableId); // Get the correct table ID based on the URL parameter
    console.log(AIRTABLE_TABLE_ID,"AIRTABLE_TABLE_ID")
    try {
      // Fetch data from Airtable using the table ID
      const response = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
        {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        }
      );

      const projectData = response.data.records;

      // Get all project names from user.projects
      const userProjectNames = user?.projects?.map((p) => p);

      // Filter projects matching user's project names
      const matchingProjects = projectData.filter((data) =>
        userProjectNames.includes(data.fields["Project Name"])
      );

      setRecords(matchingProjects);

      // Extract unique project names for the dropdown
      const uniqueProjectNames = [
        ...new Set(matchingProjects.map((p) => p.fields["Project Name"])),
      ];
      setProjects(uniqueProjectNames);

      // Set first project as selected by default
      if (uniqueProjectNames.length > 0) {
        setSelectedProjectName(uniqueProjectNames[0]);
      }
    } catch (err) {
      console.error("Error fetching project data", err);
      setRecords([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    setSelectedProjectName(e.target.value);
  };

  // Filter records based on selected project name
  const filteredRecords = selectedProjectName
    ? records.filter((rec) => rec.fields["Project Name"] === selectedProjectName)
    : records;

  // Compute all unique headers across all filtered records
  const headers = Array.from(
    new Set(filteredRecords.flatMap((rec) => Object.keys(rec.fields)))
  );

  return (
    <div className="project-dashboard container py-4">
      {/* Dropdown for unique project names */}
      {projects.length > 0 && (
        <div className="mb-3">
          <select
            className="form-select"
            value={selectedProjectName}
            onChange={handleProjectChange}
            style={{
              width: "auto", // Shrink to fit content
              minWidth: "150px", // Optional: ensure it's not too small
              display: "inline-block", // Prevent it from stretching full width
            }}
          >
            {projects.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper dragscroll mt-20">
        <table className="table custom-table table-bordered">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-4">
                  No records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr key={rec.id}>
                  {headers.map((h) => {
                    const value = rec.fields[h];

                    // Custom rendering for Start column with label + URL
                    if (h === "Generate Content" && value?.label && value?.url) {
                    // if (h === "Start") {
                        console.log(value,"value")
                      return (
                        <td key={h}>
                          <button
                            className="btn btn-primary"
                            onClick={() => window.open(value.url, "_blank")}
                          >
                            {value.label}
                          </button>
                        </td>
                      );
                    }

                    return (
                      <td key={h}>
                        {typeof value === "object" ? (
                          <pre style={{ margin: 0 }}>
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AirtableTablePage;
