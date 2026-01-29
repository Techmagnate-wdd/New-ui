import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartContainer from "../components/ui/ChartContainer";
import ChartTooltipContent from "../components/ui/ChartTooltipContent";

const data = [
  {
    date: "4 Mar",
    rank1to3: 4,
    rank4to10: 10,
    rank11to20: 6,
    rank21to50: 8,
    rank51plus: 4,
  },
  {
    date: "6 Mar",
    rank1to3: 6,
    rank4to10: 8,
    rank11to20: 5,
    rank21to50: 4,
    rank51plus: 0,
  },
  {
    date: "8 Mar",
    rank1to3: 8,
    rank4to10: 5,
    rank11to20: 6,
    rank21to50: 5,
    rank51plus: 0,
  },
  {
    date: "10 Mar",
    rank1to3: 2,
    rank4to10: 6,
    rank11to20: 3,
    rank21to50: 0,
    rank51plus: 0,
  },
  {
    date: "12 Mar",
    rank1to3: 3,
    rank4to10: 4,
    rank11to20: 3,
    rank21to50: 4,
    rank51plus: 0,
  },
  {
    date: "14 Mar",
    rank1to3: 3,
    rank4to10: 4,
    rank11to20: 5,
    rank21to50: 5,
    rank51plus: 0,
  },
  {
    date: "16 Mar",
    rank1to3: 5,
    rank4to10: 6,
    rank11to20: 5,
    rank21to50: 8,
    rank51plus: 0,
  },
  {
    date: "18 Mar",
    rank1to3: 4,
    rank4to10: 6,
    rank11to20: 5,
    rank21to50: 9,
    rank51plus: 6,
  },
  {
    date: "20 Mar",
    rank1to3: 6,
    rank4to10: 4,
    rank11to20: 8,
    rank21to50: 7,
    rank51plus: 0,
  },
  {
    date: "22 Mar",
    rank1to3: 6,
    rank4to10: 4,
    rank11to20: 8,
    rank21to50: 6,
    rank51plus: 0,
  },
  {
    date: "24 Mar",
    rank1to3: 9,
    rank4to10: 10,
    rank11to20: 6,
    rank21to50: 5,
    rank51plus: 0,
  },
  {
    date: "26 Mar",
    rank1to3: 5,
    rank4to10: 6,
    rank11to20: 8,
    rank21to50: 5,
    rank51plus: 0,
  },
  {
    date: "28 Mar",
    rank1to3: 6,
    rank4to10: 3,
    rank11to20: 4,
    rank21to50: 5,
    rank51plus: 0,
  },
  {
    date: "30 Mar",
    rank1to3: 3,
    rank4to10: 8,
    rank11to20: 4,
    rank21to50: 8,
    rank51plus: 0,
  },
  {
    date: "1 Apr",
    rank1to3: 8,
    rank4to10: 8,
    rank11to20: 5,
    rank21to50: 8,
    rank51plus: 0,
  },
];

const chartConfig = {
  rank1: {
    label: "Rank 1",
    theme: {
      light: "#556B2F", // Dark Olive Green
      dark: "#556B2F",
    },
  },
  rank2to3: {
    label: "Rank 2-3",
    theme: {
      light: "#8FBC8F", // Dark Sea Green
      dark: "#8FBC8F",
    },
  },
  rank4to5: {
    label: "Rank 4-5",
    theme: {
      light: "#EEE8AA", // Pale Goldenrod
      dark: "#EEE8AA",
    },
  },
  rank6to10: {
    label: "Rank 6-10",
    theme: {
      light: "#FFA07A", // Light Salmon
      dark: "#FFA07A",
    },
  },
  rank10plus: {
    label: "Rank > 10",
    theme: {
      light: "#DC143C", // Crimson
      dark: "#DC143C",
    },
  },
};
const KeywordsChart = ({ className, data: externalData }) => {
  const chartData = externalData || data;

  return (
    <div className={className}>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-[#4f6d86]">
          Keyword Rankings (Rank Group Wise)
        </h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                barSize={20}
                stackOffset="sign"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{ paddingBottom: "10px" }}
                />
                <Bar
                  dataKey="rank1"
                  stackId="a"
                  fill="var(--color-rank1)"
                  name={chartConfig.rank1.label}
                />
                <Bar
                  dataKey="rank2to3"
                  stackId="a"
                  fill="var(--color-rank2to3)"
                  name={chartConfig.rank2to3.label}
                />
                <Bar
                  dataKey="rank4to5"
                  stackId="a"
                  fill="var(--color-rank4to5)"
                  name={chartConfig.rank4to5.label}
                />
                <Bar
                  dataKey="rank6to10"
                  stackId="a"
                  fill="var(--color-rank6to10)"
                  name={chartConfig.rank6to10.label}
                />
                <Bar
                  dataKey="rank10plus"
                  stackId="a"
                  fill="var(--color-rank10plus)"
                  name={chartConfig.rank10plus.label}
                />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KeywordsChart;
