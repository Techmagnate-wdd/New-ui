import React from 'react';
import { Card } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
// import '../styles/Project1.css';

const SEOCard = ({ title, children, icon }) => {
  const CardIcon = icon || <GlobalOutlined />;
  
  return (
    <Card 
      className="seo-card"
      title={
        <div className="seo-card-header">
          <span className="seo-card-icon">{CardIcon}</span>
          <span className="seo-card-title">{title}</span>
        </div>
      }
    >
      {children}
    </Card>
  );
};

export default SEOCard;
