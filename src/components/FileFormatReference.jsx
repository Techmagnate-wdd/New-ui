import * as XLSX from "xlsx";
import { SiGooglesheets } from "react-icons/si";


const FileFormatReference = ({ title, columns, sampleData, fileName = "sample.xlsx" }) => {
  const handleDownload = () => {
    // Convert sampleData to worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: columns });
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample Data");
    // Trigger download
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div style={{ }}>
      {title && <h3 style={{ marginBottom: "0.5rem" }}>{title}</h3>}
      <button
        onClick={handleDownload}
        style={{
        //   background: "#2563eb",
          color: "#217346",
          border: "none",
          padding: "5px 5px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "0.95rem",
        }}
      >
         <SiGooglesheets size={20} />
        {/* 📂  */}
        Download sample.xlsx
      </button>
    </div>
  );
};

export default FileFormatReference;
