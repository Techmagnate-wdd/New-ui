import React from "react";
import TooltipIcon from "./ToolTipIcon";
import { useNavigate } from "react-router-dom";
import { DownloadIcon } from "lucide-react";

const BAR_COLORS = ["#A1E0A3", "#B3E6B5", "#C8ECC8", "#D9F3DA", "#E3F6E3"]; // Colors for bars

const RankSummary = ({ data, totalPrompt,
  selectedDate,
  selectedProject,
  selectedProjectDomain,
  selectedProjectBrand,
}) => {
  const navigate = useNavigate()
  const hasData = data && Object.keys(data).length > 0;

  // Convert rankSummary object to array (only if data exists)
  const ranksArray = hasData
    ? Object.keys(data)
      .map((rank) => ({
        rank: rank,
        percentage: data[rank].percentage || 0,
        answers: data[rank].count || 0,
      }))
      .sort((a, b) => {
        if (a.rank === "5+") return 1;
        // if (b.rank === "5+") return -1;
        return Number(a.rank) - Number(b.rank);
      })
    : [];

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        marginBottom: "20px",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 14px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#1c2024",
            margin: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            width: "100%"

          }}
        >
          <span>Which rank is your brand mentioned in answers?</span>

        </div>
      </div>

      {/* If no data, show a message */}
      {!hasData ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          No rank data available
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div
            style={{
              display: "flex",
              padding: "10px 14px",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              <span>
                Rank
                <TooltipIcon title="See exactly where your brand appears in prompt answers. If your brand is mentioned first among competitors, it ranks #1." />
              </span>
            </div>
            <div
              style={{
                width: "100px",
                textAlign: "right",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Percentage
            </div>
            <div
              style={{
                width: "100px",
                textAlign: "right",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              <span>
                Answers
                <TooltipIcon title="Total number of AI answers that mentioned your brand in the specified rank." />
              </span>
            </div>


          </div>

          {/* Rows */}
          <div>
            {ranksArray.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderBottom:
                    index < ranksArray.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                  position: "relative",
                }}
              >
                {/* Background bar */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${item.percentage}%`,
                    backgroundColor:
                      BAR_COLORS[index % BAR_COLORS.length],
                    opacity: 0.2,
                    zIndex: 1,
                  }}
                />

                {/* Rank */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    zIndex: 2,
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#111827",
                  }}
                >
                  {item.rank === "5+" ? "5+" : `Rank ${item.rank}`}
                </div>

                {/* Percentage */}
                <div
                  style={{
                    width: "100px",
                    textAlign: "right",
                    position: "relative",
                    zIndex: 2,
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {item.percentage}%
                </div>

                {/* Answers */}
                <div
                  style={{
                    width: "100px",
                    textAlign: "right",
                    position: "relative",
                    zIndex: 2,
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {item.answers}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div
        style={{
          padding: "19px 24px",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "center",
        }}
      />
      <div style={{
        display: "flex",
        justifyContent:"center"
      }}>

        <button
          onClick={() =>
            navigate(
              `/llm-dashboard/${selectedProject}/${selectedProjectDomain}/${selectedProjectBrand}?date=${selectedDate}&rank=true`
            )
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            fontSize: "14px",
            color: "#374151",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          View full report
          <span style={{ fontSize: "12px" }}>→</span>
        </button>
      </div>
    </div >
  );
};

export default RankSummary;
