import React, { useCallback, useEffect, useRef, useState } from "react";
import { getExcel, getProjects } from "../../services/api";

// Format number helper
const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    if (num >= 1_000_000_000)
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000)
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000)
        return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(num);
};

const SerpFilterComponent = ({
    user,
    filter,
    setFilter,
    onFilterChange,
    stats = {},
    projectData = {},
    showStats = true,
}) => {
    const [projects, setProjects] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allBrands, setAllBrands] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [projectUser, setProjectUser] = useState(filter.user);

    // Fetch projects once user is known
    useEffect(() => {
        if (filter.user) {
            // setFilter((prev) => ({ ...prev, user: user?._id }));
            setProjectUser(user?._id);
        }
    }, [filter.user]);

    useEffect(() => {
        if (projectUser) {
            fetchProjects();
        }
    }, [projectUser]);

    const fetchProjects = async () => {
        try {
            const res = await getProjects({ user: projectUser });
            const fetched = res.data.projects || [];
            setProjects(fetched);

            if (fetched.length > 0 && !filter.project) {
                const defaultProjectId = fetched[0]._id;
                setFilter((prev) => ({ ...prev, project: defaultProjectId }));
            }
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    };

    const getEC = async (excelFilters = {}) => {
        try {
            const res = await getExcel(filter.project, excelFilters);
            const { subCategories } = res.data.metadata || {};

            setSubCategory(subCategories || []);
        } catch (err) {
            console.error("Error fetching dependent metadata:", err);
        }
    };

    const loadBaseMetadata = async () => {
        try {
            const res = await getExcel(filter.project);
            const { brands, categories } = res.data.metadata || {};

            setAllBrands(brands || []);
            setAllCategories(categories || []);
            setCategories(categories || []);
        } catch (err) {
            console.error("Failed to load base metadata", err);
        }
    };

    useEffect(() => {
        if (filter.project) {
            getEC();
            loadBaseMetadata()
        }
    }, [filter.project]);

    useEffect(() => {
        if (!filter.project) return;

        if (!filter.brand) {
            // reset to all
            setCategories(allCategories);
            getEC();
            return;
        }

        // fetch categories & subCategories for selected brand
        (async () => {
            try {
                const res = await getExcel(filter.project, {
                    brand: filter.brand,
                });

                const { categories, subCategories } = res.data.metadata || {};
                setCategories(categories || []);
                setSubCategory(subCategories || []);
            } catch (err) {
                console.error("Error updating brand filters", err);
            }
        })();
    }, [filter.brand, filter.project]);

    useEffect(() => {
        if (!filter.project) return;
        getEC({
            brand: filter.brand || undefined,
            category: filter.category || undefined,
        });
    }, [filter.brand, filter.category, filter.project]);

    // Set user in filter on mount
    useEffect(() => {
        if (user && !filter.user) {
            setFilter((prev) => ({ ...prev, user: user._id }));
        }
    }, [user, filter.user, setFilter]);

    // Notify parent component when filters change
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filter);
        }
    }, [filter, onFilterChange]);

    // Handle reset
    const handleReset = useCallback(() => {
        setFilter((prev) => ({
            keyword: "",
            url: "",
            startDate: "",
            endDate: "",
            project: prev.project,
            brand: "",
            category: "",
            subCategory: "",
            result_type: "",
            user: prev.user,
        }));
    }, [setFilter]);

    return (
        <div className="col-auto ms-auto custom-filters">
            <div className="">
                {/* Filter Controls */}
                <div className="row gy-3 gx-3 align-items-end">
                    {/* Project */}
                    <div className="col-auto">
                        {/* <label className="form-label fw-semibold">Project</label> */}
                        <select
                            className="form-control"
                            value={filter.project}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    project: e.target.value,
                                    brand: "",
                                    category: "",
                                    subCategory: "",
                                }))
                            }
                            disabled={loading}
                        >
                            <option value="">Projects</option>
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.project_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* BRAND */}
                    <div className="col-auto">
                        {/* <label htmlFor="brandSelect" className="form-label fw-semibold">
                            Brand
                        </label> */}
                        <select
                            id="brandSelect"
                            className="form-control"
                            value={filter.brand}
                            onChange={(e) => {
                                const value = e.target.value
                                setFilter((prev) => ({
                                    ...prev,
                                    brand: value,
                                    category: "",
                                    subCategory: "",
                                }))
                            }
                            }
                        >
                            <option value="">Brand</option>
                            {/* {brands.map((b, idx) => (
                  <option key={idx} value={b}>
                    {b}
                  </option>
                ))} */}

                            {allBrands.map((b, i) => (
                                <option key={i} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CATEGORY */}
                    <div className="col-auto">
                        {/* <label
                            htmlFor="categorySelect"
                            className="form-label fw-semibold"
                        >
                            Category
                        </label> */}
                        <select
                            id="categorySelect"
                            className="form-control"
                            value={filter.category}
                            onChange={(e) => {
                                const value = e.target.value
                                setFilter((prev) => ({
                                    ...prev,
                                    category: value,
                                    subCategory: "",
                                }))

                            }}
                        >
                            <option value="">Category</option>
                            {categories.map((c, i) => (
                                <option
                                    key={i}
                                    value={c}
                                    style={{
                                        fontWeight: filter.category === c ? "600" : "normal",
                                    }}
                                >
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SUBCATEGORY */}
                    <div className="col-auto">
                        {/* <label
                            htmlFor="subCategorySelect"
                            className="form-label fw-semibold"
                        >
                            Sub Category
                        </label> */}
                        <select
                            id="subCategorySelect"
                            className="form-control"
                            value={filter.subCategory}
                            onChange={(e) => {
                                const value = e.target.value
                                setFilter((prev) => ({
                                    ...prev,
                                    subCategory: value,
                                }))
                            }}
                        >
                            <option value="">Sub Category</option>
                            {subCategory.map((sc, idx) => (
                                <option key={idx} value={sc}>
                                    {sc}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    {/* <label className="form-label fw-semibold">Date</label> */}
                    {/* <div className="col-auto">
                        <input
                            type="date"
                            className="form-control"
                            value={filter.startDate || "Start Date"}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    startDate: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />
                    </div> */}

                    <div className="col-auto position-relative">
                        <input
                            type="date"
                            className={`form-control ${!filter.startDate ? "hide-date-text" : ""}`}
                            value={filter.startDate || ""}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    startDate: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />

                        {!filter.startDate && (
                            <span className="fake-placeholder">Start Date</span>
                        )}
                    </div>

                    <div className="col-auto position-relative">
                        <input
                            type="date"
                            className={`form-control ${!filter.endDate ? "hide-date-text" : ""}`}
                            value={filter.endDate || ""}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    endDate: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />

                        {!filter.endDate && (
                            <span className="fake-placeholder">End Date</span>
                        )}
                    </div>


                    {/* <label className="form-label fw-semibold">Date</label> */}
                    {/* <div className="col-auto">
                        <input
                            type="date"
                            className="form-control"
                            value={filter.endDate || "End Date"}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    endDate: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />
                    </div> */}

                    {/* Reset Button */}
                    <div className="col-auto align-items-end pt-6">
                        <button
                            className="btn btn-secondary w-100"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Stats Section */}
                {showStats && (
                    <div
                        className="d-flex for-flex-prop gap-3 mt-3"
                        style={{ width: "fit-content" }}
                    >
                        <div className="flex-fill">
                            <div
                                className="p-3 fw-semibold flx-inner"
                                style={{
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    background: "#f8f8f8",
                                }}
                            >
                                <span>Total Keyword:</span>
                                <span style={{ color: "#000", marginLeft: "8px" }}>
                                    {stats.totalKeywords || 0}
                                </span>
                            </div>
                        </div>

                        <div className="flex-fill">
                            <div
                                className="p-3 fw-semibold flx-inner"
                                style={{
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    background: "#f8f8f8",
                                }}
                            >
                                <span>Total SV:</span>
                                <span style={{ color: "#000", marginLeft: "8px" }}>
                                    {formatNumber(stats.totalSV || 0)}
                                </span>
                            </div>
                        </div>

                        <div className="flex-fill">
                            <div
                                className="p-3 fw-semibold flx-inner"
                                style={{
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    background: "#f8f8f8",
                                }}
                            >
                                <span>Location:</span>
                                <span style={{ color: "#000", marginLeft: "8px" }}>
                                    {projectData?.country || "IN"}
                                </span>
                            </div>
                        </div>

                        <div className="flex-fill">
                            <div
                                className="p-3 fw-semibold flx-inner"
                                style={{
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    background: "#f8f8f8",
                                }}
                            >
                                <span>Language:</span>
                                <span style={{ color: "#000", marginLeft: "8px" }}>
                                    {projectData?.language?.toUpperCase() || "EN"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SerpFilterComponent;