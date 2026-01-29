import ReactApexChart from "react-apexcharts";

const RankingChart = ({ chartData = [] }) => {
  const series = [
    { name: "Rank 1", data: chartData.map((d) => d.rank1) },
    { name: "Rank 2–3", data: chartData.map((d) => d.rank2to3) },
    { name: "Rank 4–5", data: chartData.map((d) => d.rank4to5) },
    { name: "Rank 6–10", data: chartData.map((d) => d.rank6to10) },
    { name: "Rank > 10", data: chartData.map((d) => d.rank10plus) },
  ];

  // 2. Define options inline
  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: true },
    },
    colors: ["#487FFF", "#A3D39C", "#FF9F29", "#FFA559", "#EC5F5F"],

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "12%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
        dataLabels: {
          total: { enabled: false },
        },
      },
    },
    dataLabels: { enabled: false },

    xaxis: {
      type: "category",
      categories: chartData.map((d) => d.date),
      labels: {
        rotate: -45,
        style: { fontSize: "12px" },
      },
    },
    yaxis: {
      title: { text: undefined },
      labels: {
        formatter: (val) => val,
        style: { fontSize: "12px" },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => val,
      },
    },
    fill: { opacity: 1 },

    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: { columnWidth: "20%" },
          },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return (
    <div className="row gy-4">
      <div className="col-md-12">
        <div className="card h-100 p-0">
          <div className="card-header border-bottom bg-base py-16 px-24">
            <h6 className="text-lg fw-semibold mb-0">
              Keyword Rankings (Rank Group Wise)
            </h6>
          </div>
          <div className="card-body p-24">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={320}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingChart;
