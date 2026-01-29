import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import "../../styles/user.css";

const ProjectsMultiSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const renderSelectedTags = () => {
    if (selectedValues.length === 0) {
      return <span className="placeholder">Select project(s)…</span>;
    }
    const labels = options
      .filter((opt) => selectedValues.includes(opt.value))
      .map((opt) => opt.label);
    return (
      <div className="tags-container">
        {labels.map((lbl, idx) => (
          <span key={idx} className="tag-item">
            {lbl}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`projects-multiselect ${disabled ? "disabled" : ""}`}
      ref={containerRef}
    >
      {/* Input‐style container */}
      <div
        className={`select-input ${open ? "open" : ""}`}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
      >
        {renderSelectedTags()}
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="chevron-icon"
        />
      </div>

      {/* Dropdown list */}
      {open && !disabled && (
        <div className="options-dropdown">
          {options.length === 0 ? (
            <div className="">No projects available</div>
          ) : (
            options.map((opt) => (
              <label
                key={opt.value}
                className="option-item"
                htmlFor={`proj-${opt.value}`}
              >
                <input
                  type="checkbox"
                  id={`proj-${opt.value}`}
                  name="projects"
                  value={opt.value}
                  checked={selectedValues.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                />
                <span className="option-label">{opt.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsMultiSelect;
