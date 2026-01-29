import { Icon } from "@iconify/react";

const abbreviate = (value) => {
  if (value == null) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return value.toString();
};

const RankTrackerCard = ({ stats }) => {
  const ArrowIcon = ({ value }) => {
    const isPositive = (value ?? 0) >= 0;
    return (
      <Icon
        icon={isPositive ? "mdi:arrow-up-bold" : "mdi:arrow-down-bold"}
        style={{ color: isPositive ? "green" : "red" }}
        className="text-2xl align-middle"
      />
    );
  };

  // A shared gradient style: white → very light sky-blue
  const gradientStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #e0f7ff 100%)"
  };

  return (
    <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
      {/* Google Ranking */}
      <div className="col">
        <div className="card shadow-none border h-100" style={gradientStyle}>
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="fw-medium text-primary-light mb-1">
                  Google Ranking
                </p>
                <h6 className="mb-0">{stats?.googleCount ?? 0}</h6>
              </div>
              <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="mdi:google-analytics"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Change */}
      <div className="col">
        <div className="card shadow-none border h-100" style={gradientStyle}>
          <div className="card-body p-20">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="fw-medium text-primary-light mb-2">
                  Google Change
                </p>
                <div className="d-flex align-items-center gap-2">
                  <ArrowIcon value={stats?.googleChangeSum} />
                  <h6 className="mb-0">
                    {Math.abs(stats?.googleChangeSum ?? 0)}
                  </h6>
                </div>
              </div>
              <div className="w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="mdi:trending-up"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Local Rankings */}
      <div className="col">
        <div className="card shadow-none border h-100" style={gradientStyle}>
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="fw-medium text-primary-light mb-1">
                  Google Local Rankings
                </p>
                <h6 className="mb-0">{stats?.googleLocalCount ?? 0}</h6>
              </div>
              <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="mdi:map-marker-question"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Local Change */}
      <div className="col">
        <div className="card shadow-none border h-100" style={gradientStyle}>
          <div className="card-body p-20">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="fw-medium text-primary-light mb-2">
                  Google Local Change
                </p>
                <div className="d-flex align-items-center gap-2">
                  <ArrowIcon value={stats?.googleLocalChangeSum} />
                  <h6 className="mb-0">
                    {Math.abs(stats?.googleLocalChangeSum ?? 0)}
                  </h6>
                </div>
              </div>
              <div className="w-50-px h-50-px bg-success-main rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="mdi:map-search"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bing Rankings */}
      <div className="col">
        <div className="card shadow-none border h-100" style={gradientStyle}>
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="fw-medium text-primary-light mb-1">
                  Bing Rankings
                </p>
                <h6 className="mb-0">{stats?.bingCount ?? 0}</h6>
              </div>
              <div className="w-50-px h-50-px bg-red rounded-circle d-flex justify-content-center align-items-center">
                <Icon icon="logos:bing" className="text-white text-2xl mb-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bing Change */}
      <div className="col">
        <div className="card shadow-none border h-100" style={gradientStyle}>
          <div className="card-body p-20">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="fw-medium text-primary-light mb-2">
                  Bing Change
                </p>
                <div className="d-flex align-items-center gap-2">
                  <ArrowIcon value={stats?.bingChangeSum} />
                  <h6 className="mb-0">
                    {Math.abs(stats?.bingChangeSum ?? 0)}
                  </h6>
                </div>
              </div>
              <div className="w-50-px h-50-px bg-red rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="mdi:trending-up"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume */}
      <div className="col">
        <div className="card shadow-none border h-100" style={gradientStyle}>
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="fw-medium text-primary-light mb-2">Volume</p>
                <h6 className="mb-0">{abbreviate(stats?.searchVolumeSum)}</h6>
              </div>
              <div className="w-50-px h-50-px bg-red rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="mdi:chart-bar"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankTrackerCard;
