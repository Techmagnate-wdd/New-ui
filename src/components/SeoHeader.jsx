import React from 'react';
import { Typography, Space } from 'antd';
import { GlobalOutlined, BarChartOutlined, RiseOutlined } from '@ant-design/icons';
// import '../styles/Project1.css';

const { Title, Paragraph } = Typography;

const SEOHeader = ({ title, subtitle }) => {
  return (
    <div className="seo-header">
      <Space direction="vertical" size="small" align="center">
        <Space align="center">
          <GlobalOutlined className="seo-icon" />
          <Title level={2} className="seo-title">{title}</Title>
          <BarChartOutlined className="seo-icon" />
        </Space>
        
        {subtitle && <Paragraph className="seo-subtitle">{subtitle}</Paragraph>}
        
        <Space className="seo-divider">
          <div className="seo-line"></div>
          <RiseOutlined className="seo-icon" />
          <div className="seo-line"></div>
        </Space>
      </Space>
    </div>
  );
};

export default SEOHeader;
