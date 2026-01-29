import React, { useState } from "react";
import { Layout, Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
// import "../../styles/ProjectDashboard.css";

const { Header, Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    // <Layout className="app-layout">
    <Layout className={`app-layout ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout className="site-layout">
        <Content className="main-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
