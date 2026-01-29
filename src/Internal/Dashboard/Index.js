// import { useContext, useEffect, useState } from "react";
// import { dashboardCount, getProjects } from "../../services/api";
// import dayjs from "dayjs";
// import { Col, Row, Select, Table } from "antd";
// import { DashboardLayout } from "../../components/DashboardLayout";
// import KeywordsChart from "../../components/KeywordsChart";
// import AuthContext from "../../context/AuthContext";
// const { Option } = Select;

// const Index = () => {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState({
//     rank1: 0,
//     rank2_3: 0,
//     rank4_5: 0,
//     rank6_10: 0,
//   });

//   const { user } = useContext(AuthContext);
//   const userRole = user?.data?.user?.role || "";

//   const [filter, setFilter] = useState({
//     project: "",
//     user: "",
//   });

//   const [projectUser, setProjectUser] = useState(filter.user);
//   const [selectedProjectId, setSelectedProjectId] = useState();


//   const fetchProjects = async () => {
//     setLoading(true);
//     try {
//       let filteredQuery = {};
//       if (filter.projectName) filteredQuery.project = filter.projectName;
//       if (filter.domain) filteredQuery.domain = filter.domain;

//       let queryParams = {};

//       if (Object.keys(filteredQuery).length > 0) {
//         queryParams.append("filter", JSON.stringify(filteredQuery));
//       }

//       const projects = await getProjects(filter);
//       setProjects(projects.data.projects);
//     } catch (error) {
//       console.error("Failed to fetch projects:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       setFilter((prev) => ({
//         ...prev,
//         user: user?.data?.user?._id,
//       }));
//       setProjectUser(user?.data?.user?._id);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (projectUser) {
//       fetchProjects();
//     }
//   }, [projectUser]);


//   useEffect(() => {
//     if (filter.project) {
//       getCount(filter.project);
//     }
//   }, [filter]);

//   const fetchDocumentCount = async (page = 1) => {
//     try {
//       const response = await dashboardCount(filter.project);

//       setChartData(response.data.dateWiseData);
//       setTopKeywords(response.data.top_sv_keywords);
//       setStats({
//         totalKeywords: response.data.keywordsCount || 0,
//         rank1: response.data.top1RankCount || 0,
//         rank2_3: response.data.top3RankCount || 0,
//         rank4_5: response.data.top5RankCount || 0,
//         rank6_10: response.data.top10RankCount || 0,
//       });
//     } catch (err) {
//       console.error("Error fetching tasks:", err);
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-2xl font-bold text-[#4f6d86]">
//             Performance Dashboard
//           </h1>
//           <div className="w-">
//             <label
//               htmlFor="project-select"
//               className="text-sm font-medium text-gray-700"
//             >
//               Project
//             </label>
//             <div className="bg-white rounded-md shadow-sm border border-gray-300 px-3 py-2">
//               <Select
//                 id="project-select"
//                 placeholder="Filter by projects"
//                 value={filter.project}
//                 onChange={(value) => {
//                   setFilter((prev) => ({ ...prev, project: value }));
//                   setSelectedProjectId(value);
//                 }}
//               >
//                 <Option value="">All</Option>
//                 {projects.map((project) => (
//                   <Option key={project._id} value={project._id}>
//                     {project.project_name}
//                   </Option>
//                 ))}
//               </Select>
//             </div>
//           </div>

//           {/* <div className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-md shadow-sm">
//             Last updated: {new Date().toLocaleDateString()}
//           </div> */}
//         </div>

//         {/* Keywords Chart Section */}
//         <div className="mb-8">
//           <KeywordsChart data={chartData} className="w-full" />
//         </div>

//         <Row gutter={[20, 20]} className="mb-8">
//           <Col xs={24} lg={24} md={24}>
//             <Table
//               columns={search_volume_column}
//               dataSource={topKeywords}
//               rowKey={(record) => record.keyword}
//               pagination={false}
//               size="small"
//               bordered
              
//               className="bg-white rounded-lg shadow-sm"
//             />
//           </Col>
//         </Row>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Index;
