import React, { useState, useRef, useEffect } from "react";

const PLATFORMS = ["ChatGPT", "Perplexity", "Gemini", "Claude"];

const PlatformFilter = () => {
  const [open, setOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="col-md-2" ref={dropdownRef} style={{ position: "relative" }}>
      <div className="d-flex align-items-center">
        <button
          className="btn btn-outline-secondary w-100"
          style={{ height: "38px", textAlign: "left" }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {selectedPlatforms.length
            ? selectedPlatforms.join(", ")
            : "Platform"}
        </button>
      </div>

      {open && (
        <div
          className="card shadow-sm"
          style={{
            position: "absolute",
            top: "45px",
            width: "100%",
            zIndex: 10,
            padding: "10px",
          }}
        >
          {PLATFORMS.map((platform) => (
            <div key={platform} className="form-check mb-1">
              <input
                className="form-check-input"
                type="checkbox"
                value={platform}
                id={platform}
                checked={selectedPlatforms.includes(platform)}
                onChange={() => togglePlatform(platform)}
              />
              <label className="form-check-label" htmlFor={platform}>
                {platform}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatformFilter;
