import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select } from "antd";
import { showToast } from "../../lib/CustomToast";
import { addUser, editUser, getProjects } from "../../services/api";
import { useNavigate } from "react-router-dom";

const EditProject = ({ isOpen, onClose, onSubmit, editingUser }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const handleFinish = async (values) => {
    try {
      let response;
      if (editingUser) {
        response = await editUser(editingUser._id, values);
        showToast("User updated successfully!", "success");
        setTimeout(() => {
          navigate("/users");
        }, [3000]);
      } else {
        response = await addUser(values);
        showToast("User created successfully!", "success");
      }
      onSubmit(response.data);
      onClose();
    } catch (error) {
      showToast(error?.response?.data?.message || "Error occurred", "error");
    }
  };

  useEffect(() => {
    async function fetchData() {
      const response = await getProjects();
      const allProjects = response.data.projects;

      setProjects(allProjects);

      const projectOptions = allProjects.map((item) => ({
        value: item._id,
        label: item.project_name,
      }));

      setProjects(projectOptions);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue(editingUser);
    } else {
      form.resetFields();
    }
  }, [editingUser, form]);

  return (
    <Modal
      title="Edit User"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      style={{ backgroundColor: "#2980b9", color: "#fff" }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Please enter first name" }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please enter last name" }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="Mobile Number"
          name="contact"
          rules={[
            { required: true, message: "Please enter mobile number" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Enter a valid 10-digit number",
            },
          ]}
        >
          <Input placeholder="Enter mobile number" maxLength={10} />
        </Form.Item>

        <Form.Item label="Assign Projects" name="projects">
          <Select
            mode="multiple"
            placeholder="Select projects"
            options={projects}
          />
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            block
            style={{ backgroundColor: "#2980b9", color: "#fff" }}
          >
            Submit
          </Button>
          <Button onClick={onClose} block style={{ marginTop: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProject;
