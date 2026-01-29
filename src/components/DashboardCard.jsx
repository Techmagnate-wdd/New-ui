import React from "react";
import { Card, Progress } from "antd";
import { cn } from "../lib/utils";

const DashboardCard = ({ title, value, className, progressPercent = 100 }) => {
  return (
    <Card
      className={cn("transition-all hover:shadow-md", className)}
      bodyStyle={{
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {title}
      </h3>
      <div className="flex items-center justify-center py-4">
        <span className="text-3xl font-bold text-center">{value}</span>
      </div>
    </Card>
  );
};

export default DashboardCard;
