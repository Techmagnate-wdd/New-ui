import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const SummaryToolTipIcon = ({ tooltipTitle, size = 13, placement = "top", className = "" }) => {
  const tooltipStyle = {
    color: "#fff",               // white text
    textAlign: "left",
    fontSize: "0.9rem",          // slightly larger than default
  };
  return (
    <OverlayTrigger
      placement={placement}
      overlay={
        <Tooltip id={`tooltip-${tooltipTitle}`}>
          <div style={{ whiteSpace: "pre-wrap", maxWidth: "200px", ...tooltipStyle }}>{tooltipTitle || ""}</div>
        </Tooltip>
      }
    >
      <span style={{ color: "grey", cursor: "pointer" }} className={`ms-1 ${className}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size * 1.5}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-circle-help w-3 h-3 text-sc-muted-foreground"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <path d="M12 17h.01"></path>
        </svg>
      </span>
    </OverlayTrigger>
  );
};

export default SummaryToolTipIcon;
