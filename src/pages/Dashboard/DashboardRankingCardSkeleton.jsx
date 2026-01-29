import React from "react";

const CardSkeleton = () => (
  <div className="col">
    <div className="card shadow-none border h-100">
      <div className="card-body p-20">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="w-100">
            <div className="skeleton skeleton-text w-50" />
            <div className="skeleton skeleton-text lg w-75" />
          </div>
          <div className="skeleton skeleton-circle w-50-px h-50-px" />
        </div>
      </div>
    </div>
  </div>
);

const DashboardRankingCardSkeleton = () => {
  return (
    <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export default DashboardRankingCardSkeleton;
