// import React from "react";
// import { Icon } from "@iconify/react";
// import { Link } from "react-router-dom";
// const ProjectDropdown = ({ title }) => {
//   return (
//     <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24'>
//       <h6 className='fw-semibold mb-0'>Dashboard</h6>
//       <ul className='d-flex align-items-center gap-2'>
//         <li className='fw-medium'>
//           <Link
//             to='/'
//             className='d-flex align-items-center gap-1 hover-text-primary'
//           >
//             <Icon
//               icon='solar:home-smile-angle-outline'
//               className='icon text-lg'
//             />
//             Dashboard
//           </Link>
//         </li>
//         <li> - </li>
//         <li className='fw-medium'>{title}</li>
//       </ul>
//     </div>
//   );
// };

// export default ProjectDropdown;

// src/components/child/ProjectDropdown.jsx
import React from "react";
import { Icon } from "@iconify/react";

const ProjectDropdown = ({
  title,
  value,
  loading,
  projects = [],
  onChange,
}) => {
  // find the display name for the current value
  const currentName = loading
    ? "Loading..."
    : projects.find((p) => p._id === value)?.project_name || "Select project";

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
      <h6 className="fw-semibold mb-0">Dashboard</h6>

      {/* dropdown starts here */}
      <ul className="">
        <div className="btn-group">
          <button
            style={{ color: "#fff", background: "#487FFF" }}
            type="button"
            className="btn btn-outline-link dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <Icon icon="solar:apps-list" className="me-1" />
            {currentName}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            {loading && (
              <li className="dropdown-item text-center">Loading...</li>
            )}
            {!loading &&
              projects.map((proj) => (
                <li key={proj._id}>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => onChange(proj._id)}
                  >
                    <span>{proj.project_name}</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </ul>
      {/* dropdown ends here */}
    </div>
  );
};

export default ProjectDropdown;
