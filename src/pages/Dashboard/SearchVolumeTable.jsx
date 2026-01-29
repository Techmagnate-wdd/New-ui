import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const SearchVolumeTable = ({ top_sv }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedData = showAll ? top_sv : top_sv.slice(0, 10);

  return (
    <div className="col-xxl-9 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="d-flex flex-wrap align-items-center gap-1 justify-content-between mb-16">
            <ul
              className="nav border-gradient-tab nav-pills mb-0"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link d-flex align-items-center"
                  id="pills-recent-leads-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-recent-leads"
                  type="button"
                  role="tab"
                  aria-controls="pills-recent-leads"
                  aria-selected="false"
                  tabIndex={-1}
                >
                  Top Performing Keywords (Based on High SV){" "}
                  <span className="text-sm fw-semibold py-6 px-12 bg-neutral-500 rounded-pill text-white line-height-1 ms-12 notification-alert">
                    {top_sv.length}
                  </span>
                </button>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-primary-600 hover-text-primary d-flex align-items-center gap-1 btn btn-link p-0"
            >
              {showAll ? "Show Less" : "View All"}
              <Icon icon="solar:alt-arrow-right-linear" className="icon" />
            </button>
          </div>
          <div className="tab-content" id="pills-tabContent">
            <div
              className="tab-pane fade show active"
              id="pills-to-do-list"
              role="tabpanel"
              aria-labelledby="pills-to-do-list-tab"
              tabIndex={0}
            >
              <div className="table-responsive scroll-sm">
                <table className="table bordered-table sm-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Keyword</th>
                      <th scope="col">Rank</th>
                      <th scope="col">SV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.map(({ keyword, rank, searchVolumeData }) => (
                      <tr key={keyword}>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="text-md fw-medium">{keyword}</span>
                          </div>
                        </td>
                        <td>{rank}</td>
                        <td>{searchVolumeData.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchVolumeTable;