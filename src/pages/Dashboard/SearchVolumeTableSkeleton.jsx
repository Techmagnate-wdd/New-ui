import React from "react";

const SearchVolumeTableSkeleton = () => {
  const rows = Array.from({ length: 10 });

  return (
    <div className="col-xxl-9 col-xl-12">
      <div className="card h-100">
        <div className="card-body p-24">
          <div className="d-flex flex-wrap align-items-center gap-1 justify-content-between mb-16">
            <div className="skeleton skeleton-text w-50" />
            <div className="skeleton skeleton-text w-25" />
          </div>

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
                {rows.map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="skeleton skeleton-text w-75" />
                    </td>
                    <td>
                      <div className="skeleton skeleton-text w-50" />
                    </td>
                    <td>
                      <div className="skeleton skeleton-text w-50" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchVolumeTableSkeleton;
