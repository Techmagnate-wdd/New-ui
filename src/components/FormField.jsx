import React from 'react';
import { Form, Input } from 'antd';
// import '../styles/Project1.css';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  value,
  required = false, 
  children,
  onChange
}) => {
  return (
    <Form.Item 
      label={label}
      name={name}
      rules={[{ required: required, message: `Please input ${label}!` }]}
      className="seo-form-item"
    >
      {children || (
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="seo-input"
        />
      )}
    </Form.Item>
  );
};

export default FormField;