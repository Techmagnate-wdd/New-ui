import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Image } from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  RiseOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  FileAddOutlined,
  UploadOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  LineChartOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
// import "../../styles/Sidebar.css";
import AuthContext from "../../context/AuthContext";

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useContext(AuthContext);
  const userRole = user?.data?.user?.role || "";
  const userName = user?.data?.user || "";
  const location = useLocation();
  const navigate = useNavigate();

  // Get currently open menu keys
  const getOpenKeys = (pathname) => {
    if (pathname.includes("/project")) return ["project"];
    if (pathname.includes("/ranking")) return ["rankings"];
    if (pathname.includes("/local-ranking")) return ["local_ranking"];
    if (pathname.includes("/user")) return ["user"];
    return [];
  };

  const [openKeys, setOpenKeys] = useState(getOpenKeys(location.pathname));

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  // Dummy user data (Replace with real user data)
  const dummy = {
    name: "Ranking Tool",
    email: "ranking-tool@techmagnate.com",
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Sider
      style={{
        overflow: "auto",
      }}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="seo-sidebar"
      width={230}
      theme="dark"
    >
      <div className="sidebar-logo">
        {!collapsed ? (
          <Image
            src="https://rank-tracker.techmagnate.com/logo_bg_1.svg"
            alt="RankRise"
            preview={false}
            width={160}
          />
        ) : (
          <span className="sidebar-collapsed-logo">TM</span>
        )}
      </div>

      {/* Sidebar Menu */}

        <div className="sidebar-content">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            className="sidebar-menu"
          >
            <Menu.Item key="/" icon={<DashboardOutlined />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>

            <SubMenu key="project" icon={<ProjectOutlined />} title="Projects">
              <Menu.Item key="/projects" icon={<FileTextOutlined />}>
                <Link to="/projects">Project List</Link>
              </Menu.Item>
              <Menu.Item key="/create-project" icon={<FileAddOutlined />}>
                <Link to="/create-project">Create Project</Link>
              </Menu.Item>
              <Menu.Item key="/upload-keywords" icon={<UploadOutlined />}>
                <Link to="/upload-keywords">Upload Keywords</Link>
              </Menu.Item>
            </SubMenu>

            <SubMenu key="rankings" icon={<RiseOutlined />} title="Rankings">
              <Menu.Item key="/ranking-report" icon={<BarChartOutlined />}>
                <Link to="/ranking-report">Ranking Report</Link>
              </Menu.Item>
              <Menu.Item key="/rank-group" icon={<AreaChartOutlined />}>
                <Link to="/rank-group">Group Ranking</Link>
              </Menu.Item>
              <Menu.Item
                key="/category-rank-group"
                icon={<LineChartOutlined />}
              >
                <Link to="/category-rank-group">Category Ranking</Link>
              </Menu.Item>
              <Menu.Item key="/rank-tracker" icon={<RiseOutlined />}>
                <Link to="/rank-tracker">Keywords Movement</Link>
              </Menu.Item>
              <Menu.Item key="/ranking-movement" icon={<BarChartOutlined />}>
                <Link to="/ranking-movement">Ranking Movement</Link>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </div>
        <div className="sidebar-content">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            className="sidebar-menu"
          >
            <Menu.Item key="/" icon={<DashboardOutlined />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>

            <SubMenu key="project" icon={<ProjectOutlined />} title="Projects">
              <Menu.Item key="/projects" icon={<FileTextOutlined />}>
                <Link to="/projects">Project List</Link>
              </Menu.Item>
              <Menu.Item key="/create-project" icon={<FileAddOutlined />}>
                <Link to="/create-project">Create Project</Link>
              </Menu.Item>
              <Menu.Item key="/upload-keywords" icon={<UploadOutlined />}>
                <Link to="/upload-keywords">Upload Keywords</Link>
              </Menu.Item>
            </SubMenu>

            <SubMenu
              key="local_project"
              icon={<ProjectOutlined />}
              title="Local Projects"
            >
              <Menu.Item key="/local-projects" icon={<FileTextOutlined />}>
                <Link to="/local-projects">Local Project List</Link>
              </Menu.Item>
              <Menu.Item key="/create-local-project" icon={<FileAddOutlined />}>
                <Link to="/create-local-project">Create Local Project</Link>
              </Menu.Item>
              <Menu.Item key="/upload-local-keywords" icon={<UploadOutlined />}>
                <Link to="/upload-local-keywords">Upload Local Keywords</Link>
              </Menu.Item>
            </SubMenu>

            <SubMenu key="rankings" icon={<RiseOutlined />} title="Rankings">
              <Menu.Item key="/ranking-report" icon={<BarChartOutlined />}>
                <Link to="/ranking-report">Ranking Report</Link>
              </Menu.Item>
              <Menu.Item key="/rank-group" icon={<AreaChartOutlined />}>
                <Link to="/rank-group">Group Ranking</Link>
              </Menu.Item>
              <Menu.Item
                key="/category-rank-group"
                icon={<LineChartOutlined />}
              >
                <Link to="/category-rank-group">Category Ranking</Link>
              </Menu.Item>
              <Menu.Item key="/rank-tracker" icon={<RiseOutlined />}>
                <Link to="/rank-tracker">Keywords Movement</Link>
              </Menu.Item>
              <Menu.Item key="/ranking-movement" icon={<BarChartOutlined />}>
                <Link to="/ranking-movement">Ranking Movement</Link>
              </Menu.Item>
            </SubMenu>

            <SubMenu
              key="local_ranking"
              icon={<RiseOutlined />}
              title="Local Rankings"
            >
              <Menu.Item
                key="local_ranking"
                icon={<BarChartOutlined />}
                title="Local Rankings"
              >
                <Link to="/local-ranking">Local Ranking</Link>
              </Menu.Item>
            </SubMenu>

            <SubMenu key="traffic" icon={<RiseOutlined />} title="Paid GP Tool">
              <Menu.Item key="/upload-target" icon={<UploadOutlined />}>
                <Link to="/upload-target" style={{ color: "#fff" }}>
                  Add Project
                </Link>
              </Menu.Item>

              <Menu.Item
                key="traffic-report"
                icon={<BarChartOutlined />}
                title="report"
              >
                <Link to="/traffic-report">Report</Link>
              </Menu.Item>
            </SubMenu>

            {userRole === "admin" && (
              <SubMenu key="user" icon={<UserOutlined />} title="User">
                <Menu.Item key="/users" icon={<UsergroupAddOutlined />}>
                  <Link to="/users">User List</Link>
                </Menu.Item>
                <Menu.Item key="/add-user" icon={<UsergroupAddOutlined />}>
                  <Link to="/add-user">Add User</Link>
                </Menu.Item>
              </SubMenu>
            )}
          </Menu>
        </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <UserOutlined className="user-icon" />
          {!collapsed && (
            <div>
              <div className="user-name">
                {userName.firstName + " " + userName.lastName || dummy.name}
              </div>
            </div>
          )}
        </div>

        <Menu theme="dark" mode="inline" className="logout-menu">
          <Menu.Item
            key="/logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            <Link to="/login">Logout</Link>
          </Menu.Item>
        </Menu>
      </div> 
    </Sider>
  );
};

export default Sidebar;
