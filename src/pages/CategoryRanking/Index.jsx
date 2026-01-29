import React, { useContext, useEffect, useState } from "react";
import { Table } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import {
  getAllRanksByCategory,
  getExcel,
  getProjects,
} from "../../services/api";
import AuthContext from "../../context/AuthContext";

const CategoryRankGroupIndex = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [excelData, setExcelData] = useState([]);

  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";

  const [filter, setFilter] = useState({
    keyword: "",
    url: "",
    dateRange: ["", ""], // [startDate, endDate] in "YYYY-MM-DD" format
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    result_type: "",
    user: "",
  });

  const [projectUser, setProjectUser] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const resultTypeOptions = [
    { key: "organic", label: "Organic" },
    { key: "paid", label: "Paid" },
    { key: "people_also_ask_expanded_element", label: "People also ask" },
    { key: "link_element", label: "Link element" },
    { key: "local_pack", label: "Local pack" },
    { key: "ai_overview_reference", label: "AI overview" },
  ];

  // 1. When `user` becomes available, set `filter.user` and `projectUser`
  useEffect(() => {
    if (user) {
      const userId = user?._id;
      setFilter((prev) => ({ ...prev, user: userId }));
      setProjectUser(userId);
    }
  }, [user]);

  // 2. Fetch projects once `projectUser` is known
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

      // Set a default project immediately after fetching
      if (fetched.length > 0) {
        const defaultProjectId =
          userRole === "admin" ? "67e2e957eaa96687a1297e6c" : fetched[0]._id;

        setFilter((prev) => ({ ...prev, project: defaultProjectId }));
        setSelectedProjectId(defaultProjectId);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // 3. Fetch Excel data whenever `selectedProjectId` or certain filters change
  useEffect(() => {
    if (selectedProjectId) {
      fetchExcelData();
    }
  }, [
    selectedProjectId,
    filter.dateRange,
    filter.keyword,
    filter.brand,
    filter.category,
    filter.subCategory,
    filter.result_type,
  ]);

  const fetchExcelData = async () => {
    try {
      const res = await getExcel(selectedProjectId, filter);
      const tasks = res.data.tasks || [];
      setExcelData(tasks);

      // Derive unique brands, categories, subCategories
      setBrands([...new Set(tasks.map((item) => item.Brand || ""))]);
      setCategoryOptions([
        ...new Set(tasks.map((item) => item.Category || "")),
      ]);
      setSubCategoryOptions([
        ...new Set(tasks.map((item) => item.SubCategory || "")),
      ]);
    } catch (err) {
      console.error("Error fetching Excel data:", err);
    }
  };

  // 4. Once Excel data is ready, fetch the category-based rank data
  useEffect(() => {
    if (excelData.length > 0 && selectedProjectId) {
      fetchCategoryRankData();
    }
  }, [excelData]);

  const fetchCategoryRankData = async () => {
    try {
      const [start, end] = filter.dateRange;
      const startDate = start ? dayjs(start).format("YYYY-MM-DD") : "";
      const endDate = end ? dayjs(end).format("YYYY-MM-DD") : "";

      const query = {
        ...(filter.keyword && { keyword: filter.keyword }),
        ...(startDate && endDate && { startDate, endDate }),
        ...(selectedProjectId && { project: selectedProjectId }),
        ...(filter.result_type && { result_type: filter.result_type }),
        ...(filter.category && { category: filter.category }),
        ...(filter.subCategory && { subCategory: filter.subCategory }),
        ...(filter.brand && { brand: filter.brand }),
      };

      const res = await getAllRanksByCategory(query);
      const { data: rankData, uniqueDates } = res.data;
      setData(rankData);
      generateColumns(uniqueDates);
    } catch (err) {
      console.error("Error fetching category rank data:", err);
    }
  };

  const generateColumns = (uniqueDates) => {
    const dynamicCols = [
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        // fixed: "left",
        width: 180,
      },
      ...uniqueDates.map((date) => ({
        title: (
          <div style={{ textAlign: "center" }}>
            {moment(date).format("DD MMM, YYYY")}
          </div>
        ),
        children: [
          {
            title: "KW",
            dataIndex: `${date}_keywordCount`,
            key: `${date}_keywordCount`,
            width: 100,
            align: "center",
          },
          {
            title: "SV",
            dataIndex: `${date}_searchVolume`,
            key: `${date}_searchVolume`,
            width: 100,
            align: "center",
          },
          {
            title: "SOV(%)",
            dataIndex: `${date}_sov`,
            key: `${date}_sov`,
            width: 100,
            align: "center",
          },
        ],
      })),
    ];

    setColumns(dynamicCols);
  };

  // Handle resetting filter to initial state
  const handleReset = () => {
    setFilter({
      keyword: "",
      url: "",
      dateRange: ["", ""],
      project: "67dd1920d59ef5f5103f984d", 
      brand: "",
      category: "",
      subCategory: "",
      result_type: "",
      user: filter.user, // keep current user
    });
    setSelectedProjectId("67dd1920d59ef5f5103f984d");
  };

  return (
    <div className="project-dashboard container1 py-4">
      <div>
        <h6 className="mt-2" style={{ color: "#4a4a4a" }}>
          Category Wise Ranking Report
        </h6>
      </div>

      <div className="card shadow-sm mb-3">
        {/* ── First Row: Project, Brand, Category, SubCategory, Type ── */}
        <div className="card-body">
          <div className="row gy-3 gx-3 align-items-end">
            {/* Project Dropdown */}
            <div className="col-md-3">
              <label htmlFor="projectSelect" className="form-label fw-semibold">
                Project
              </label>
              <select
                id="projectSelect"
                className="form-control"
                value={filter.project || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({ ...prev, project: val }));
                  setSelectedProjectId(val);
                }}
              >
                {/* <option value="">Select Project</option> */}
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div className="col-md-3">
              <label htmlFor="brandSelect" className="form-label fw-semibold">
                Brand
              </label>
              <select
                id="brandSelect"
                className="form-control"
                value={filter.brand}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, brand: e.target.value }))
                }
              >
                <option value="">All</option>
                {brands.map((b, idx) => (
                  <option key={idx} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="col-md-3">
              <label
                htmlFor="categorySelect"
                className="form-label fw-semibold"
              >
                Category
              </label>
              <select
                id="categorySelect"
                className="form-control"
                value={filter.category}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">All</option>
                {categoryOptions.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* SubCategory Dropdown */}
            <div className="col-md-3">
              <label
                htmlFor="subCategorySelect"
                className="form-label fw-semibold"
              >
                Sub Category
              </label>
              <select
                id="subCategorySelect"
                className="form-control"
                value={filter.subCategory}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    subCategory: e.target.value,
                  }))
                }
              >
                <option value="">All</option>
                {subCategoryOptions.map((sc, idx) => (
                  <option key={idx} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            {/* Result Type Dropdown */}
            <div className="col-md-2">
              <label htmlFor="typeSelect" className="form-label fw-semibold">
                Type
              </label>
              <select
                id="typeSelect"
                className="form-control"
                value={filter.result_type}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    result_type: e.target.value,
                  }))
                }
              >
                <option value="">All</option>
                {resultTypeOptions.map((rt) => (
                  <option key={rt.key} value={rt.key}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

          {/* Start Date Picker */}
            <div className="col-md-5">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={filter.dateRange[0] || ""}
                onChange={(e) => {
                  const newRange = [...filter.dateRange];
                  newRange[0] = e.target.value;
                  setFilter((prev) => ({ ...prev, dateRange: newRange }));
                }}
              />
            </div>

            {/* End Date Picker */}
            <div className="col-md-5">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control"
                value={filter.dateRange[1] || ""}
                onChange={(e) => {
                  const newRange = [...filter.dateRange];
                  newRange[1] = e.target.value;
                  setFilter((prev) => ({ ...prev, dateRange: newRange }));
                }}
              />
            </div>

            {/* Reset Button (aligned right) */}
            <div className="col-md-3 align-items-end pt-6">
              <button className="btn btn-secondary w-100" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          </div>
        </div>

      {/* ── Table ── */}
      <div className="table-wrapper dragscroll mt-20">
        <Table
          className="custom-table"
          rowKey="category"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default CategoryRankGroupIndex;
