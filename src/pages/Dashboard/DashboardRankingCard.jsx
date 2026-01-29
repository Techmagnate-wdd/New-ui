import { Icon } from "@iconify/react";

const DashboardRankingCard = ({ stats }) => {
  return (
    <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
      {/* Total Keywords */}
      <div className="col">
        <div className="card shadow-none border bg-gradient-start-1 h-100">
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="small text-secondary mb-1">Total #KWD</p>
                <h4 className="mb-0 fw-bold text-dark">
                  {stats.totalKeywords}
                </h4>
              </div>
              <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                {/* tag icon to represent keywords */}
                <Icon
                  icon="fa6-solid:tag"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 1 */}
      <div className="col">
        <div className="card shadow-none border bg-gradient-start-2 h-100">
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="small text-secondary mb-1">Top 1</p>
                <h4 className="mb-0 fw-bold text-dark">{stats.rank1}</h4>
              </div>
              {/* bg-purple  */}
              <div className="w-50-px h-50-px 
              rounded-circle d-flex justify-content-center align-items-center">
                {/* trophy icon */}
                {/* <Icon
                  icon="fa6-solid:trophy"
                  className="text-white text-2xl mb-0"
                /> */}
                <img
                  src="/Top1.png"
                  alt="Tag"
                  className="w-6 h-6 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-3 */}
      <div className="col">
        <div className="card shadow-none border bg-gradient-start-3 h-100">
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="small text-secondary mb-1">2-3</p>
                <h4 className="mb-0 fw-bold text-dark">{stats.rank2_3}</h4>
              </div>
              {/* bg-info  */}
              <div className="w-50-px h-50-px 
              rounded-circle d-flex justify-content-center align-items-center">
                {/* medal icon */}
                {/* <Icon
                  icon="fa6-solid:medal"
                  className="text-white text-2xl mb-0"
                /> */}
                <img
                  src="/2-3.png"
                  alt="Tag"
                  className="w-6 h-6 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-5 */}
      <div className="col">
        <div className="card shadow-none border bg-gradient-start-4 h-100">
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="small text-secondary mb-1">4-5</p>
                <h4 className="mb-0 fw-bold text-dark">{stats.rank4_5}</h4>
              </div>
              {/* bg-success-main  */}
              <div className="w-50-px h-50-px 
              rounded-circle d-flex justify-content-center align-items-center">
                {/* user-group to represent multiple entries */}
                {/* <Icon
                  icon="fa6-solid:user-group"
                  className="text-white text-2xl mb-0"
                /> */}
                <img
                  src="/4-5.png"
                  alt="Tag"
                  className="w-6 h-6 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6-10 */}
      <div className="col">
        <div className="card shadow-none border bg-gradient-start-5 h-100">
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="small text-secondary mb-1">6-10</p>
                <h4 className="mb-0 fw-bold text-dark">{stats.rank6_10}</h4>
              </div>
              {/* bg-red  */}
              <div className="w-50-px h-50-px 
              rounded-circle d-flex justify-content-center align-items-center">
                {/* <Icon
                  icon="fa6-solid:chart-line"
                  className="text-white text-2xl mb-0"
                /> */}
                {/* chart-line to represent lower ranks/trend */}
                 <img
                  src="/6-10.png"
                  alt="Tag"
                  className="w-6 h-6 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10 plus */}
      {/* <div className="col">
        <div className="card shadow-none border bg-gradient-start-5 h-100">
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="small text-secondary mb-1"> Greater than 10</p>
                <h4 className="mb-0 fw-bold text-dark">{stats.rank10plus}</h4>
              </div>
              <div className="w-50-px h-50-px bg-red rounded-circle d-flex justify-content-center align-items-center">
                <Icon
                  icon="fa6-solid:chart-line"
                  className="text-white text-2xl mb-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <div className="col">
        <div className="card shadow-none border bg-light h-100">
          <div className="card-body p-20">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="small text-secondary mb-1">Greater than 10</p>
                <h4 className="mb-0 fw-bold text-dark">{stats.rank10plus}</h4>
              </div>
              {/* bg-secondary */}
              <div className="w-50-px h-50-px 
               rounded-circle d-flex justify-content-center align-items-center">
                {/* <Icon
                  icon="fa6-solid:arrow-trend-down"
                  className="text-white text-2xl mb-0"
                /> */}
                <img
                  src="/Greater_than_10.png"
                  alt="Tag"
                  className="w-6 h-6 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default DashboardRankingCard;
