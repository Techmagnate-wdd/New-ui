import React, { useState } from "react";

const SnippetCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 120; // adjust according to your table width

  if (!text) return "";

  const isLong = text.length > maxLength;

  return (
    <div>
      {expanded ? text : text.substring(0, maxLength)}
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          style={{ color: "#2563EB", cursor: "pointer", marginLeft: "6px" }}
        >
          {expanded ? " Show less" : "... Read more"}
        </span>
      )}
    </div>
  );
};

export default SnippetCell;
