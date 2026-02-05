import SummaryToolTipIcon from "../pages/LLM/SummaryToolTipIcon";

export const CustomLegend = ({ tooltipTitle }) => (
  <div className="w-full flex justify-center items-center">

    <div className="flex items-center gap-8 text-sm">

      {/* AVG POSITION */}
      <div className="flex items-center gap-1 leading-none text-blue-600">
        <span className="flex items-center">Avg Position</span>
        <SummaryToolTipIcon
          tooltipTitle="Average ranking position of your domain"
        />
      </div>

      {/* VISIBILITY */}
      <div className="flex items-center gap-1 leading-none text-green-600">
        <span className="flex items-center">Visibility %</span>
        <SummaryToolTipIcon
          tooltipTitle={tooltipTitle}
        />
      </div>

    </div>

  </div>
);
