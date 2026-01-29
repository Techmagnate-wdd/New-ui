import React from 'react';
import { Form, Select } from 'antd';
// import '../styles/SEO.css';

const LocationSelect = ({ 
  countryCode, 
  data = [], 
  handleChange,
  loading = false 
}) => {
  return (
    <Form.Item 
      label="Location"
      name="location"
      rules={[{ required: true, message: 'Please select Location!' }]}
      className="seo-form-item"
    >
      <Select
        placeholder={!countryCode ? 'Select country first' : loading ? 'Loading locations...' : 'Select Location'}
        disabled={!countryCode || loading}
        loading={loading}
        onChange={(value) => {
          const synthEvent = { target: { name: 'location', value } };
          handleChange(synthEvent);
        }}
        className="seo-select"
        options={data.map(location => ({
          value: location.value,
          label: location.label
        }))}
      />
    </Form.Item>
  );
};

export default LocationSelect;
