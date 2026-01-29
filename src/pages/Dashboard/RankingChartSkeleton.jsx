import React from "react";

const RankingChartSkeleton = () => {
  return (
    <div className="row gy-4">
      <div className="col-md-12">
        <div className="card h-100 p-0">
          <div className="card-header border-bottom bg-base py-16 px-24">
            <div className="skeleton skeleton-text w-50" />
          </div>
          <div className="card-body p-24">
            <div className="skeleton skeleton-block w-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingChartSkeleton;
