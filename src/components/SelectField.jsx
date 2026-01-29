import React from 'react';
import { Form, Select } from 'antd';
// import '../styles/Project1.css';

const SelectField = ({ 
  label, 
  name, 
  options = [], 
  placeholder = 'Select an option', 
  showSearch,
  required = false,
  value,
  loading = false,
  onChange
}) => {
  return (
    <Form.Item 
      label={label}
      name={name}
      rules={[{ required: required, message: `Please select ${label}!` }]}
      className="seo-form-item"
    >
      <Select
        placeholder={loading ? 'Loading...' : placeholder}
        value={value || undefined}
        showSearch
        onChange={(value) => {
          const synthEvent = { target: { name, value } };
          onChange(synthEvent);
        }}
        loading={loading}
        disabled={loading}
        className="seo-select"
        options={options.map(option => ({
          value: option.value,
          label: option.label
        }))}
      />
    </Form.Item>
  );
};

export default SelectField;
