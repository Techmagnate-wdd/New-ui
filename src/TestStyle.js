// import React from 'react'

// const a = {
//       position: "fixed",
//   width: "100%",
//   height: "100vh",
// backgroundColor: "white",
//   zIndex: 5000,
 
// }

// const TestStyle = () => {
//   return (
//     <>
//       <div style={a}>


// {!loadingExcel && !loadingStatus && totalPages > 0 && (
//               <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: "1px solid #dee2e6" }}>
//                 <div style={{ fontSize: "14px", color: "#6c757d" }}>
//                   Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} results
//                 </div>
//                 <div className="d-flex gap-2">
//                   <button
//                     onClick={handlePrevPage}
//                     disabled={currentPage === 1}
//                     className="btn btn-sm btn-outline-secondary"
//                     style={{
//                       cursor: currentPage === 1 ? "not-allowed" : "pointer",
//                       opacity: currentPage === 1 ? 0.5 : 1
//                     }}
//                   >
//                     Previous
//                   </button>

//                   <div className="d-flex gap-1">
//                     {getPageNumbers().map((pageNum) => (
//                       <button
//                         key={pageNum}
//                         onClick={() => handlePageClick(pageNum)}
//                         className={btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'}}
//                         style={{ minWidth: "40px" }}
//                       >
//                         {pageNum}
//                       </button>
//                     ))}
//                   </div>

//                   <button
//                     onClick={handleNextPage}
//                     disabled={currentPage === totalPages}
//                     className="btn btn-sm btn-outline-secondary"
//                     style={{
//                       cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//                       opacity: currentPage === totalPages ? 0.5 : 1
//                     }}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}


//       </div>
//     </>
//   )
// }

// export default TestStyle



// import React from "react";

// const containerStyle = {
//   position: "fixed",
//   width: "100%",
//   height: "100vh",
//   backgroundColor: "white",
//   zIndex: 5000,
//   overflowY: "auto",
//   padding: "20px"
// };

// const TestStyle = ({
//   loadingExcel,
//   loadingStatus,
//   totalPages,
//   currentPage,
//   totalRows,
//   pageSize,
//   handlePrevPage,
//   handleNextPage,
//   handlePageClick,
//   getPageNumbers
// }) => {
//   return (
//     <div style={containerStyle}>

//       {!loadingExcel && !loadingStatus && totalPages > 0 && (
//         <div
//           className="d-flex justify-content-between align-items-center mt-4 pt-3"
//           style={{ borderTop: "1px solid #dee2e6" }}
//         >
//           {/* Left Section */}
//           <div style={{ fontSize: "14px", color: "#6c757d" }}>
//             Showing {(currentPage - 1) * pageSize + 1} to{" "}
//             {Math.min(currentPage * pageSize, totalRows)} of {totalRows} results
//           </div>

//           {/* Pagination Buttons */}
//           <div className="d-flex gap-2">

//             {/* Previous Button */}
//             <button
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//               className="btn btn-sm btn-outline-secondary"
//               style={{
//                 cursor: currentPage === 1 ? "not-allowed" : "pointer",
//                 opacity: currentPage === 1 ? 0.5 : 1
//               }}
//             >
//               Previous
//             </button>

//             {/* Page Numbers */}
//             <div className="d-flex gap-1">
//               {getPageNumbers().map((pageNum) => (
//                 <button
//                   key={pageNum}
//                   onClick={() => handlePageClick(pageNum)}
//                   className={`btn btn-sm ${
//                     currentPage === pageNum
//                       ? "btn-primary"
//                       : "btn-outline-secondary"
//                   }`}
//                   style={{ minWidth: "40px" }}
//                 >
//                   {pageNum}
//                 </button>
//               ))}
//             </div>

//             {/* Next Button */}
//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className="btn btn-sm btn-outline-secondary"
//               style={{
//                 cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//                 opacity: currentPage === totalPages ? 0.5 : 1
//               }}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default TestStyle;



// import React, { useState, useMemo } from "react";

// const TestStyle = () => {
//   // -------------------------------
//   // TEMPORARY FAKE DATA (50 rows)
//   // -------------------------------
//   const fakeData = Array.from({ length: 50 }, (_, i) => ({
//     id: i + 1,
//     name: `Item ${i + 1}`,
//   }));

//   const pageSize = 5;
//   const totalRows = fakeData.length;
//   const totalPages = Math.ceil(totalRows / pageSize);

//   const [currentPage, setCurrentPage] = useState(1);

//   // helpers
//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (pageNum) => {
//     setCurrentPage(pageNum);
//   };

//   const getPageNumbers = () => {
//     return Array.from({ length: totalPages }, (_, i) => i + 1);
//   };

//   // data for current page
//   const currentData = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return fakeData.slice(start, start + pageSize);
//   }, [currentPage]);

//   const loadingExcel = false;
//   const loadingStatus = false;

//   return (
//     <div style={{ padding: "20px" }}>
//       <h3>Pagination Test</h3>

//       {/* Display fake data */}
//       <ul>
//         {currentData.map((item) => (
//           <li key={item.id} style={{ fontSize: "18px" }}>
//             {item.name}
//           </li>
//         ))}
//       </ul>

//       {/* Your exact style block */}
//       {!loadingExcel && !loadingStatus && totalPages > 0 && (
//         <div
//           className="d-flex justify-content-between align-items-center mt-4 pt-3"
//           style={{ borderTop: "1px solid #dee2e6" }}
//         >
//           <div style={{ fontSize: "14px", color: "#6c757d" }}>
//             Showing {(currentPage - 1) * pageSize + 1} to{" "}
//             {Math.min(currentPage * pageSize, totalRows)} of {totalRows} results
//           </div>

//           <div className="d-flex gap-2">
//             {/* Previous */}
//             <button
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//               className="btn btn-sm btn-outline-secondary"
//               style={{
//                 cursor: currentPage === 1 ? "not-allowed" : "pointer",
//                 opacity: currentPage === 1 ? 0.5 : 1,
//               }}
//             >
//               Previous
//             </button>

//             {/* Page numbers */}
//             <div className="d-flex gap-1">
//               {getPageNumbers().map((pageNum) => (
//                 <button
//                   key={pageNum}
//                   onClick={() => handlePageClick(pageNum)}
//                   className={`btn btn-sm ${
//                     currentPage === pageNum
//                       ? "btn-primary"
//                       : "btn-outline-secondary"
//                   }`}
//                   style={{ minWidth: "40px" }}
//                 >
//                   {pageNum}
//                 </button>
//               ))}
//             </div>

//             {/* Next */}
//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className="btn btn-sm btn-outline-secondary"
//               style={{
//                 cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//                 opacity: currentPage === totalPages ? 0.5 : 1,
//               }}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TestStyle;
