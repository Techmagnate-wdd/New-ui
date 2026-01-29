import React, { useState, useMemo } from "react";
import moment from "moment";

const formatNumber = (n) => {
  if (n == null) return "";
  if (typeof n === "number") return n.toLocaleString();
  const v = Number(n);
  return isNaN(v) ? String(n) : v.toLocaleString();
};

const truncate = (s, len) => {
  if (!s) return "";
  return s.length > len ? s.slice(0, len - 3) + "..." : s;
};

const csvEscape = (value) => {
  if (value == null) return "";
  const s = String(value);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const thStyle = {
  padding: "10px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: "#6b7280",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e6e9ee",
};

const tdStyle = {
  padding: "10px 16px",
  verticalAlign: "top",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #f1f3f5",
};


const DetailsModal = ({
  isOpen,
  onClose,
  loading,
  rows = [],
  page = 1,
  limit = 50,
  total = 0,
  onPageChange,
  title,
  onDownloadAll, // function provided by parent to fetch ALL rows
  filterContext = null, // optional { type, value } to display active filter
}) => {
  console.log(rows, "rows11")
  const [exportLoading, setExportLoading] = useState(false);


  const isFeaturedSnippet = title === "Featured Snippet";
  const isAppPack = title === "App Pack";
  const isPAAView = title === "People Also Ask";
  const isImagesView = title === "Images";
  const isLocalView = title === "Local Pack";
  const isTopStoriesView = title === "Top Stories";
  const isShortVideosView = title === "Short Videos";
  const isDiscussionsAndForumsView = title === "Discussions And Forums";
  const isShoppingView = title === "Shopping";
  const isVideos = title === "Videos";
  const isPAAExport = isPAAView;
  const showRank = !isPAAView && !isFeaturedSnippet && !isAppPack && !isImagesView && !isLocalView && !isTopStoriesView && !isShortVideosView && !isDiscussionsAndForumsView && !isVideos && !isShoppingView;
  const baseCols = 3;
  const colSpan =
    baseCols +
    (isPAAView ? 4 : 0) +
    (showRank ? 1 : 0);
  const headings = isPAAExport
    ? ["Keyword", "Question", "Question Rank", "Reference Url", "Url Rank", "Search Volume", "Answer"]
    : isImagesView ? ["Keyword", "URL", "Search Volume"]
      : isLocalView ? ["Keyword", "URL", "Local Pack Rank", "Phone", "CID", "Title", "Description", "Search Volume"]
        : isTopStoriesView ? ["Keyword", "Source", "URL", "Rank", "Title", "Search Volume"]
          : isShortVideosView ? ["Keyword", "Source", "URL", "Rank", "Title", "Search Volume"]
            : isDiscussionsAndForumsView ? ["Keyword", "Source", "URL", "Rank", "Title", "Search Volume"]
              : isVideos ? ["Keyword", "Source", "URL", "Rank", "Search Volume"]
                : isShoppingView ? ["Keyword", "Source", "Rank", "Current Price", "Displayed Price", "URL", "Title", "Search Volume"]
                  : ["Keyword", "URL", "Search Volume"];

  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

  // build numeric page items with ellipsis for large totals
  const buildPageItems = (current, totalPagesLocal) => {
    const items = [];
    const maxButtons = 7;

    if (totalPagesLocal <= maxButtons) {
      for (let i = 1; i <= totalPagesLocal; i++) items.push(i);
      return items;
    }

    items.push(1);
    let left = current - 1;
    let right = current + 1;

    if (left <= 2) {
      left = 2;
      right = 4;
    }
    if (right >= totalPagesLocal - 1) {
      right = totalPagesLocal - 1;
      left = right - 2;
    }

    if (left > 2) items.push("...");
    for (let i = left; i <= right; i++) {
      if (i > 1 && i < totalPagesLocal) items.push(i);
    }
    if (right < totalPagesLocal - 1) items.push("...");
    items.push(totalPagesLocal);

    return items;
  };

  const pageItems = buildPageItems(page, totalPages);

  // memoize exportRows generation helpers
  const buildExportRows = useMemo(
    () =>
      (allRows, isPAAExport, isImagesView, isLocalView) =>
        (allRows || []).map((r) =>
          isPAAExport
            ? {
              "Keyword": r.keyword ?? "",
              "Question": r.title ?? "",
              "Question Rank": r.question_rank ?? "",
              "Reference Url": r.url ?? "",
              "Url Rank": r.url_rank ?? "",
              "Search Volume": r.sv ?? "",
              "Answer": r.answer ?? "",
            }
            : isImagesView ? {
              "Keyword": r.keyword ?? "",
              "URL": r.url ?? "",
              "Search Volume": r.sv ?? "",
            }
              : isTopStoriesView ? {
                "Keyword": r.keyword ?? "",
                "Source": r.source ?? "",
                "URL": r.url ?? "",
                "Rank": r.rank ?? "",
                "Title": r.title ?? "",
                "Search Volume": r.sv ?? "",
              }
                : isShortVideosView ? {
                  "Keyword": r.keyword ?? "",
                  "Source": r.source ?? "",
                  "URL": r.url ?? "",
                  "Rank": r.rank ?? "",
                  "Title": r.title ?? "",
                  "Search Volume": r.sv ?? "",
                }
                  : isDiscussionsAndForumsView ? {
                    "Keyword": r.keyword ?? "",
                    "Source": r.source ?? "",
                    "URL": r.url ?? "",
                    "Rank": r.rank ?? "",
                    "Title": r.title ?? "",
                    "Search Volume": r.sv ?? "",
                  }
                    : isVideos ? {
                      "Keyword": r.keyword ?? "",
                      "Source": r.source ?? "",
                      "URL": r.url ?? "",
                      "Rank": r.rank ?? "",
                      "Search Volume": r.sv ?? "",
                    }
                      : isLocalView ? {
                        "Keyword": r.keyword ?? "",
                        "URL": r.url ?? "",
                        "Local Pack Rank": r.local_pack_rank ?? "",
                        "Phone": r.phone ?? "",
                        "CID": r.cid ?? "",
                        "Title": r.title ?? "",
                        "Description": r.description ?? "",
                        "Search Volume": r.sv ?? "",
                      }
                        : isShoppingView ? {
                          "Keyword": r.keyword ?? "",
                          "Source": r.source ?? "",
                          "Rank": r.rank ?? "",
                          "Current Price": r.current_price ?? "",
                          "Displayed Price": r.displayed_price ?? "",
                          "URL": r.url ?? "",
                          "Title": r.title ?? "",
                          "Search Volume": r.sv ?? "",
                        }
                          : {
                            "Keyword": r.keyword ?? "",
                            "URL": r.url ?? "",
                            "Search Volume": r.sv ?? ""
                          }
        ),
    []
  );

  const downloadExcel = async () => {
    // 1) Ask parent for ALL rows (not just current page) if provided
    setExportLoading(true);
    try {
      let allRows = rows;
      if (typeof onDownloadAll === "function") {
        try {
          const result = await onDownloadAll();
          if (Array.isArray(result)) {
            allRows = result;
          }
        } catch (e) {
          console.error("onDownloadAll failed, falling back to current page rows", e);
        }
      }
      setExportLoading(false);

      const exportRows = buildExportRows(allRows, isPAAView, isImagesView, isLocalView);

      const filenameBase = title ? title.replace(/\s+/g, "_").toLowerCase() : "serp_details";
      const now = moment().format("YYYYMMDD_HHmmss");
      const filename = `${filenameBase}_${now}.xlsx`;

      try {
        const XLSX = await import(/* webpackChunkName: "xlsx" */ "xlsx");
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportRows, {
          header: headings,
        });

        // set column widths
        const wscols = [{ wch: 40 }, { wch: 60 }, { wch: 15 }, { wch: 8 }, { wch: 20 }];
        ws["!cols"] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Details");
        XLSX.writeFile(wb, filename);
        return;
      } catch (e) {
        console.warn("xlsx not available, falling back to CSV export", e);
      }

      // CSV fallback (still uses ALL rows)
      const headers = headings;
      const csvRows = [headers.join(",")];
      const exportRowsCsv = exportRows;
      for (const r of exportRowsCsv) {
        let rowExcelData = isPAAView ?
          [
            csvEscape(r.Keyword),
            csvEscape(r.title),
            csvEscape(r.question_rank),
            csvEscape(r.reference_url),
            csvEscape(r.url_rank),
            csvEscape(r["Search Volume"]),
            csvEscape(r.text),
          ] :
          isImagesView ?
            [
              csvEscape(r.Keyword),
              csvEscape(r.URL),
              csvEscape(r["Search Volume"]),
            ] :
            isLocalView ?
              [
                csvEscape(r.Keyword),
                csvEscape(r.URL),
                csvEscape(r["Local Pack Rank"]),
                csvEscape(r.Phone),
                csvEscape(r.CID),
                csvEscape(r.Title),
                csvEscape(r.Description),
                csvEscape(r["Search Volume"]),
              ] :
              isTopStoriesView ?
                [
                  csvEscape(r.Keyword),
                  csvEscape(r.Source),
                  csvEscape(r.URL),
                  csvEscape(r["Rank"]),
                  csvEscape(r.Title),
                  csvEscape(r["Search Volume"]),
                ] :
                isShortVideosView ?
                  [
                    csvEscape(r.Keyword),
                    csvEscape(r.Source),
                    csvEscape(r.URL),
                    csvEscape(r["Rank"]),
                    csvEscape(r.Title),
                    csvEscape(r["Search Volume"]),
                  ] :
                  isDiscussionsAndForumsView ?
                    [
                      csvEscape(r.Keyword),
                      csvEscape(r.Source),
                      csvEscape(r.URL),
                      csvEscape(r["Rank"]),
                      csvEscape(r.Title),
                      csvEscape(r["Search Volume"]),
                    ] :
                    isVideos ?
                      [
                        csvEscape(r.Keyword),
                        csvEscape(r.Source),
                        csvEscape(r.URL),
                        csvEscape(r["Rank"]),
                        csvEscape(r["Search Volume"]),
                      ] :
                      isShoppingView ?
                        [
                          csvEscape(r.Keyword),
                          csvEscape(r.Source),
                          csvEscape(r["Rank"]),
                          csvEscape(r.current_price),
                          csvEscape(r.displayed_price),
                          csvEscape(r.URL),
                          csvEscape(r.title),
                          csvEscape(r["Search Volume"]),
                        ] :
                        [
                          csvEscape(r.Keyword),
                          csvEscape(r.URL),
                          csvEscape(r["Search Volume"]),
                          csvEscape(r.Count),
                          csvEscape(r.Brand),
                        ]
        const row = rowExcelData
        csvRows.push(row.join(","));
      }
      const csvContent = csvRows.join("\r\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", filename.replace(/\.xlsx$/, ".csv"));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  // Helper to render small meta under keyword: count + brand
  const renderMetaLine = (r) => {
    const parts = [];
    if (r.count != null) parts.push(`${formatNumber(r.count)} result${Number(r.count) !== 1 ? "s" : ""}`);
    if (r.brand) parts.push(String(r.brand));
    if (r.domain) parts.push(String(r.domain).replace(/^www\./, ""));
    if (!parts.length) return null;
    return (
      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
        {parts.join(" • ")}
      </div>
    );
  };

  // display friendly filter badge if filterContext passed
  const renderFilterBadge = () => {
    if (!filterContext || !filterContext.type) return null;
    const { type, value } = filterContext;
    const readVal = value == null ? "" : String(value);
    const label = `${String(type)}${readVal ? `: ${readVal}` : ""}`;
    return (
      <div style={{ display: "inline-block", marginLeft: 8 }}>
        <span
          style={{
            fontSize: 12,
            background: "#eef5ff",
            color: "#0868a0",
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid rgba(8,104,160,0.08)",
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`modal fade ${isOpen ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered"
        role="document"
        style={{ maxWidth: 900 }}
      >
        <div
          className="modal-content"
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 10px 35px rgba(16,24,40,0.12)",
          }}
        >
          {/* Header */}
          <div
            className="modal-header"
            style={{
              background: "#0868a0",
              color: "#fff",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "6px 16px",
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h5
                className="modal-title mb-0"
                style={{ fontWeight: 600, color: "#fff", margin: 0 }}
              >
                {title}
              </h5>
              {renderFilterBadge()}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn btn-sm btn-light"
                onClick={downloadExcel}
                title="Download as Excel"
                disabled={exportLoading}
              >
                {exportLoading ? "Exporting..." : "Export"}
              </button>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table
              className="table table-hover table-sm mb-0"
              style={{
                minWidth: isFeaturedSnippet || isAppPack ? 800 : 1100,
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              {/* ================= THEAD ================= */}
              <thead
                style={{
                  background: "#fafbfc",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <tr>
                  <th style={thStyle}>Keyword</th>

                  {isPAAView && (
                    <>
                      <th style={thStyle}>Question</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>
                        Question Rank
                      </th>
                    </>
                  )}

                  {isTopStoriesView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Source
                    </th>
                  )}

                  {isShortVideosView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Source
                    </th>
                  )}

                  {isDiscussionsAndForumsView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Source
                    </th>
                  )}

                  {isVideos && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Source
                    </th>
                  )}
                  {isShoppingView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Source
                    </th>
                  )}

                  {showRank && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Rank
                    </th>
                  )}

                  <th style={thStyle}>
                    {isPAAView ? "Reference Url" : "URL"}
                  </th>

                  {isTopStoriesView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Rank
                    </th>
                  )}

                  {isShortVideosView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Rank
                    </th>
                  )}

                  {isDiscussionsAndForumsView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Rank
                    </th>
                  )}

                  {isVideos && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Rank
                    </th>
                  )}

                  {isShoppingView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Rank
                    </th>
                  )}


                  {isPAAView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Url Rank
                    </th>
                  )}

                  {isLocalView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Local Pack Rank
                    </th>
                  )}

                  {isLocalView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Phone
                    </th>
                  )}

                  {isLocalView && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      CID
                    </th>
                  )}

                  {isShoppingView && (
                    <th style={{ ...thStyle }}>
                      Current Price
                    </th>
                  )}
                  {isShoppingView && (
                    <th style={{ ...thStyle }}>
                      Displayed Price
                    </th>
                  )}

                  {isLocalView && (
                    <th style={{ ...thStyle }}>
                      Title
                    </th>
                  )}

                  {isTopStoriesView && (
                    <th style={{ ...thStyle }}>
                      Title
                    </th>
                  )}

                  {isShortVideosView && (
                    <th style={{ ...thStyle }}>
                      Title
                    </th>
                  )}

                  {isDiscussionsAndForumsView && (
                    <th style={{ ...thStyle }}>
                      Title
                    </th>
                  )}

                  {isShoppingView && (
                    <th style={{ ...thStyle }}>
                      Title
                    </th>
                  )}

                  {isLocalView && (
                    <th style={{ ...thStyle }}>
                      Description
                    </th>
                  )}

                  <th style={{ ...thStyle, textAlign: "right" }}>
                    Search Volume
                  </th>

                  {isPAAView && (
                    <th style={thStyle}>Answer</th>
                  )}
                </tr>
              </thead>


              {/* ================= TBODY ================= */}

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={colSpan} style={{ padding: 28, textAlign: "center" }}>
                      <div className="spinner-border" role="status" />
                    </td>
                  </tr>
                ) : rows && rows.length ? (
                  rows.map((r, idx) => (
                    <tr key={idx}>
                      {/* Keyword */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                          {r.keyword}
                        </div>
                        {renderMetaLine(r)}
                      </td>

                      {isTopStoriesView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.source ?? ""}
                          </td>
                        </>
                      )}

                      {isShortVideosView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.source ?? ""}
                          </td>
                        </>
                      )}

                      {isDiscussionsAndForumsView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.source ?? ""}
                          </td>
                        </>
                      )}

                      {isVideos && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.source ?? ""}
                          </td>
                        </>
                      )}

                      {isShoppingView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.source ?? ""}
                          </td>
                        </>
                      )}



                      {isPAAView && (
                        <>
                          <td style={tdStyle}>{r.title || "—"}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.question_rank ?? "—"}
                          </td>
                        </>
                      )}

                      {showRank && (
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {r.rank ?? "—"}
                        </td>
                      )}

                      {/* URL */}
                      <td style={{ ...tdStyle, minWidth: 320 }}>
                        <a
                          href={r.url}
                          title={r.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#0b5ed7",
                            textDecoration: "none",
                            wordBreak: "break-all",
                            display: "block",
                          }}
                        >
                          {truncate(r.url, 50)}
                        </a>
                      </td>

                      {isPAAView && (
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {r.url_rank ?? "—"}
                        </td>
                      )}

                      {isLocalView && (
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {r.local_pack_rank ?? "—"}
                        </td>
                      )}

                      {isLocalView && (
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {r.phone ?? "—"}
                        </td>
                      )}

                      {isLocalView && (
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {r.cid ?? "—"}
                        </td>
                      )}

                      {isLocalView && (
                        <td style={{ ...tdStyle }}>
                          {r.title ?? "—"}
                        </td>
                      )}

                      {isLocalView && (
                        <td style={{ ...tdStyle }}>
                          {r.description ?? "—"}
                        </td>
                      )}

                      {isTopStoriesView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.rank ?? ""}
                          </td>
                        </>
                      )}

                      {isShortVideosView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.rank ?? ""}
                          </td>
                        </>
                      )}

                      {isDiscussionsAndForumsView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.rank ?? ""}
                          </td>
                        </>
                      )}

                      {isVideos && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.rank ?? ""}
                          </td>
                        </>
                      )}

                      {isShoppingView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.rank ?? ""}
                          </td>
                        </>
                      )}
                      {isShoppingView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.current_price ?? ""}
                          </td>
                        </>
                      )}
                      {isShoppingView && (
                        <>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            {r.displayed_price ?? ""}
                          </td>
                        </>
                      )}
                      {isShoppingView && (
                        <>
                          <td style={{ ...tdStyle }}>
                            {r.title ?? ""}
                          </td>
                        </>
                      )}

                      {isShortVideosView && (
                        <>
                          <td style={{ ...tdStyle }}>
                            {r.title ?? ""}
                          </td>
                        </>
                      )}

                      {isTopStoriesView && (
                        <>
                          <td style={{ ...tdStyle }}>
                            {r.title ?? ""}
                          </td>
                        </>
                      )}

                      {isDiscussionsAndForumsView && (
                        <>
                          <td style={{ ...tdStyle }}>
                            {r.title ?? ""}
                          </td>
                        </>
                      )}


                      {/* Search Volume */}
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {formatNumber(r.sv)}
                      </td>

                      {isPAAView && (
                        <td style={tdStyle} title={r.answer || ""}>
                          {r.answer ? truncate(r.answer, 50) : "—"}
                        </td>
                      )}
                    </tr> 
                  ))
                ) : (
                  <tr>
                    <td colSpan={colSpan} style={{ padding: 28, textAlign: "center" }}>
                      No details found.
                    </td>
                  </tr>
                )}
              </tbody>


            </table>
          </div>


          {/* Footer with numeric pagination */}
          <div
            className="modal-footer"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 18px",
            }}
          >
            <div>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {total > 0 && (
                <span style={{ fontSize: 13, color: "#6b7280", marginRight: 8 }}>
                  Page {page} of {totalPages} &nbsp;|&nbsp; {(page - 1) * limit + 1}–
                  {Math.min(page * limit, total)} of {total}
                </span>
              )}

              {total > limit && (
                <>
                  <button
                    className="btn btn-outline-primary btn-sm me-1"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1, limit)}
                  >
                    Prev
                  </button>

                  {pageItems.map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} style={{ padding: "4px 6px", fontSize: 13, color: "#6b7280" }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={`p-${item}`}
                        className={`btn btn-sm ${item === page ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => item !== page && onPageChange(item, limit)}
                        disabled={item === page}
                        style={{ minWidth: 36 }}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    className="btn btn-outline-primary btn-sm ms-1"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1, limit)}
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


};

export default DetailsModal;

