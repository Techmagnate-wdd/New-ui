// const LeftDropdown = ({ value, loading, projects = [], onChange }) => {
//   return (
//     <div className="col-xl-6">
//       <div className="card h-100 p-0">
//         <div className="card-header border-bottom bg-base py-16 px-24">
//           <h6 className="text-lg fw-semibold mb-0">Select Project</h6>
//         </div>
//         <div className="card-body p-24">
//           <div className="d-flex align-items-center">
//             <div className="btn-group dropstart">
//               <button
//                 className="btn text-secondary hover-text-primary px-18 py-11 dropdown-toggle"
//                 type="button"
//                 data-bs-toggle="dropdown"
//                 aria-expanded="false"
//               >
//                 {loading
//                   ? "Loading..."
//                   : projects.find(p => p._id === value)?.project_name ||
//                     "Select project"}
//               </button>
//               <ul className="dropdown-menu">
//                 {loading && (
//                   <li className="px-16 py-8 text-center">Loading...</li>
//                 )}
//                 {!loading && projects.map(proj => (
//                   <li key={proj._id}>
//                     <button
//                       type="button"
//                       className="dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900"
//                       onClick={() => onChange(proj._id)}
//                     >
//                       {proj.project_name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeftDropdown;



// src/components/LeftDropdownBootstrap.jsx
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

const LeftDropdown = ({
  value,
  loading,
  projects = [],
  onChange,
  style,          // you can pass inline styles
  className,      // or a custom className for external positioning
}) => {
  const label = loading
    ? "Loading..."
    : projects.find((p) => p._id === value)?.project_name || "Select project";

  return (
    <Dropdown 
      drop="start"               // opens to the left
      align="end"                // aligns menu’s right edge to toggle’s right edge
      style={style} 
      className={className}
    >
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"                // small button
        id="dropdown-select-project"
        className="px-2 py-1 text-sm"
      >
        {label}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto" }}>
        {loading ? (
          <Dropdown.ItemText className="text-center">Loading...</Dropdown.ItemText>
        ) : (
          projects.map((proj) => (
            <Dropdown.Item
              key={proj._id}
              onClick={() => onChange(proj._id)}
            >
              {proj.project_name}
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LeftDropdown;
