// import React, {
//   useCallback,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import dayjs from "dayjs";
// import { Spinner } from "react-bootstrap";

// import {
//   getExcel,
//   getPeopleAlsoAskMetrics,
//   getProjects,
// } from "../../services/api";
// import AuthContext from "../../context/AuthContext";
// import PAACard from "./PAACard";

// const DEBOUNCE_MS = 350;

// function formatNumber(num) {
//   if (!num && num !== 0) return "";
//   if (num >= 1_000_000_000)
//     return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
//   if (num >= 1_000_000)
//     return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
//   if (num >= 1_000)
//     return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
//   return String(num);
// }

// const PAAPage = () => {
//   const { user } = useContext(AuthContext);

//   const [filter, setFilter] = useState({
//     keyword: "",
//     url: "",
//     selectedDate: "",
//     project: "",
//     brand: "",
//     category: "",
//     subCategory: "",
//     result_type: "",
//     user: "",
//   });

//   const [projects, setProjects] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [categoryOptions, setCategoryOptions] = useState([]);
//   const [subCategoryOptions, setSubCategoryOptions] = useState([]);
//   const [totalKeywords, setTotalKeywords] = useState(0);
//   const [totalSV, setTotalSV] = useState(0);
//   const [selectedProjectData, setSelectedProjectData] = useState()

//   const [loadingExcel, setLoadingExcel] = useState(false);

//   const projectsInFlightRef = useRef(false);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [osData, setOsData] = useState("")

//   // ---- data loaders shared across cards ----

//   const fetchProjects = useCallback(
//     async () => {
//       try {
//         if (!user) return;
//         const resp = await getProjects({ user: user._id });
//         setProjects(resp.data?.projects || []);
//       } catch (err) {
//         if (err?.name === "AbortError") return;
//         console.error("fetchProjects error:", err);
//       } finally {
//         projectsInFlightRef.current = false;
//       }
//     },
//     [user]
//   );


//   const fetchExcelData = useCallback(
//     async (projectId, currentFilter, signal) => {
//       if (!projectId) return;
//       setLoadingExcel(true);
//       try {
//         const res = await getExcel(projectId, currentFilter, { signal });
//         const tasks = res.data?.tasks || [];

//         const brandList = tasks.map((t) => t.Brand).filter(Boolean);
//         setBrands([...new Set(brandList)]);

//         const catList = tasks.map((t) => t.Category).filter(Boolean);
//         setCategoryOptions([...new Set(catList)]);

//         const subList = tasks.map((t) => t.SubCategory).filter(Boolean);
//         setSubCategoryOptions([...new Set(subList)]);

//         const uniqueKeywords = new Set(
//           tasks
//             .map((t) =>
//               (t.Keywords || "").toString().trim().toLowerCase()
//             )
//             .filter(Boolean)
//         );
//         setTotalKeywords(uniqueKeywords.size);

//         const excelSV = tasks.reduce((s, r) => {
//           const sv =
//             Number(r.sv || r.SearchVolume || r.search_volume || 0) || 0;
//           return s + sv;
//         }, 0);
//         setTotalSV(excelSV);
//       } catch (err) {
//         if (err?.name === "AbortError") return;
//         console.error("fetchExcelData error:", err);
//       } finally {
//         setLoadingExcel(false);
//       }
//     },
//     []
//   );

//   // ---- effects: user / projects / excel ----

//   useEffect(() => {
//     if (user && !filter.user) {
//       setFilter((prev) => ({ ...prev, user: user._id }));
//     }
//   }, [user, filter.user]);

//   useEffect(() => {
//     if (!user) return;
//     if (projectsInFlightRef.current) return;
//     projectsInFlightRef.current = true;

//     const controller = new AbortController();
//     (async () => {
//       await fetchProjects(controller.signal);
//     })();

//     return () => {
//       try {
//         controller.abort();
//       } catch (e) { }
//       projectsInFlightRef.current = false;
//     };
//   }, [user, fetchProjects]);

//   useEffect(() => {
//     if (projects.length && !filter.project) {
//       setFilter((prev) => ({ ...prev, project: projects[0]._id }));
//       setSelectedProjectData(projects[0])
//       setSelectedProjectId(projects[0]._id);
//     }
//   }, [projects, filter.project]);

//   useEffect(() => {
//     if (!filter.project) return;
//     setSelectedProjectId(filter.project);
//     const currentProjectData = projects.find((proj) => proj._id === filter.project)
//     setSelectedProjectData(currentProjectData)
//     const c = new AbortController();
//     fetchExcelData(filter.project, filter, c.signal);
//     return () => {
//       try {
//         c.abort();
//       } catch (e) { }
//     };
//   }, [filter.project, filter.brand, filter.category, filter.subCategory, fetchExcelData, filter.selectedDate]);

//   // ---- handlers ----

//   const handleReset = useCallback(() => {
//     setFilter((prev) => ({
//       keyword: "",
//       url: "",
//       selectedDate: "",
//       project: selectedProjectId || prev.project,
//       brand: "",
//       category: "",
//       subCategory: "",
//       result_type: "",
//       user: prev?.user || "",
//     }));
//   }, [selectedProjectId]);

//   // ---- UI ----

//   return (
//     <div className="project-dashboard container py-4">
//       <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
//         SERP Features
//       </h6>

//       {/* Filters */}
//       <div className="card shadow-sm">
//         <div className="card-body">
//           <div className="row gy-3 gx-3 align-items-end">
//             <div className="col-md-3">
//               <label className="form-label fw-semibold">Project</label>
//               <select
//                 className="form-control"
//                 value={filter.project}
//                 onChange={(e) =>
//                   setFilter((prev) => ({
//                     ...prev,
//                     project: e.target.value,
//                   }))
//                 }
//               >
//                 {projects.map((p) => (
//                   <option key={p._id} value={p._id}>
//                     {p.project_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* <div className="col-md-3">
//               <label className="form-label fw-semibold">Brand</label>
//               <select
//                 className="form-control"
//                 value={filter.brand}
//                 onChange={(e) =>
//                   setFilter((prev) => ({
//                     ...prev,
//                     brand: e.target.value,
//                   }))
//                 }
//               >
//                 <option value="">All</option>
//                 {brands.map((b, i) => (
//                   <option key={i} value={b}>
//                     {b}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="col-md-3">
//               <label className="form-label fw-semibold">Category</label>
//               <select
//                 className="form-control"
//                 value={filter.category}
//                 onChange={(e) =>
//                   setFilter((prev) => ({
//                     ...prev,
//                     category: e.target.value,
//                   }))
//                 }
//               >
//                 <option value="">All</option>
//                 {categoryOptions.map((c, i) => (
//                   <option key={i} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="col-md-3">
//               <label className="form-label fw-semibold">Sub Category</label>
//               <select
//                 className="form-control"
//                 value={filter.subCategory}
//                 onChange={(e) =>
//                   setFilter((prev) => ({
//                     ...prev,
//                     subCategory: e.target.value,
//                   }))
//                 }
//               >
//                 <option value="">All</option>
//                 {subCategoryOptions.map((s, i) => (
//                   <option key={i} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div> */}

//             <div className="col-md-4">
//               <label className="form-label fw-semibold">Date</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={filter.selectedDate}
//                 onChange={(e) =>
//                   setFilter((prev) => ({
//                     ...prev,
//                     selectedDate: e.target.value,
//                   }))
//                 }
//               />
//             </div>

//             <div className="col-md-2 align-items-end pt-6">
//               <button
//                 className="btn btn-secondary w-100"
//                 onClick={handleReset}
//               >
//                 Reset
//               </button>
//             </div>
//           </div>

//           <div
//             className="d-flex for-flex-prop gap-3 mt-3"
//             style={{ width: "fit-content" }}
//           >
//             <div className="flex-fill">
//               <div
//                 className="p-3 fw-semibold flx-inner"
//                 style={{
//                   border: "1px solid #d1d5db",
//                   borderRadius: "10px",
//                   background: "#f8f8f8",
//                 }}
//               >
//                 <span>Total Keyword:</span>
//                 <span style={{ color: "#000", marginLeft: "8px" }}>
//                   {totalKeywords}
//                 </span>
//               </div>
//             </div>

//             <div className="flex-fill">
//               <div
//                 className="p-3 fw-semibold flx-inner"
//                 style={{
//                   border: "1px solid #d1d5db",
//                   borderRadius: "10px",
//                   background: "#f8f8f8",
//                 }}
//               >
//                 <span>Total SV:</span>
//                 <span style={{ color: "#000", marginLeft: "8px" }}>
//                   {formatNumber(totalSV)}
//                 </span>
//               </div>
//             </div>

//             <div className="flex-fill">
//               <div
//                 className="p-3 fw-semibold flx-inner"
//                 style={{
//                   border: "1px solid #d1d5db",
//                   borderRadius: "10px",
//                   background: "#f8f8f8",
//                 }}
//               >
//                 <span>Location:</span>
//                 <span style={{ color: "#000", marginLeft: "8px" }}>
//                   {selectedProjectData?.country || "IN"}
//                 </span>
//               </div>
//             </div>

//             <div className="flex-fill">
//               <div
//                 className="p-3 fw-semibold flx-inner"
//                 style={{
//                   border: "1px solid #d1d5db",
//                   borderRadius: "10px",
//                   background: "#f8f8f8",
//                 }}
//               >
//                 <span>Language:</span>
//                 <span style={{ color: "#000", marginLeft: "8px" }}>
//                   {selectedProjectData?.language?.toUpperCase() || "EN"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Cards section */}
//       {loadingExcel ? (
//         <div className="text-center p-4">
//           <Spinner animation="border" />
//         </div>
//       ) : (
//         <>
//           {/* 1️⃣ Featured Snippet card */}
//           <PAACard filter={filter} setTotalSV={setTotalSV} setTotalKeywords={setTotalKeywords} />
//         </>
//       )}
//     </div>
//   );
// };

// export default PAAPage;













// current filter optimization

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import dayjs from "dayjs";
import { Spinner } from "react-bootstrap";

import {
  getExcel,
  getPeopleAlsoAskMetrics,
  getProjects,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";
import PAACard from "./PAACard";
import FilterComponent from "./FilterComponent";


const PAAPage = () => {
  const { user } = useContext(AuthContext);

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    selectedDate: "",
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    user: "",
  });

  const [stats, setStats] = useState({
    totalKeywords: 0,
    totalSV: 0,
  });

  const [selectedProjectData, setSelectedProjectData] = useState()
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [osData, setOsData] = useState("")

  const handleFilterChange = (newFilter) => {
    console.log("Filters changed:", newFilter);
  };

  // ---- UI ----
  return (
    <div className="project-dashboard container1 py-4">
      <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
        SERP Features
      </h6>

      {/* Reusable Filter Component */}
      <FilterComponent
        user={user}
        filter={filter}
        setFilter={setFilter}
        onFilterChange={handleFilterChange}
        stats={stats}
        projectData={selectedProjectData}
        showStats={true}
      />

      {/* Cards section */}
      {loadingExcel ? (
        <div className="text-center p-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {/* 1️⃣ Featured Snippet card */}
          {/* <PAACard filter={filter} setTotalSV={setTotalSV} setTotalKeywords={setTotalKeywords} /> */}

          <PAACard
            filter={filter}
            setTotalSV={(sv) => setStats((prev) => ({ ...prev, totalSV: sv }))}
            setTotalKeywords={(kw) =>
              setStats((prev) => ({ ...prev, totalKeywords: kw }))
            }
            setOsData={setOsData}
            setSelectedProjectData={setSelectedProjectData}
          />
        </>
      )}
    </div>
  );
};

export default PAAPage;
