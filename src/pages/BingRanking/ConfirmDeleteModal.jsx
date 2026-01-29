import React from "react";
import { Modal, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, project }) => {
  return (
    <Modal
      title="Confirm Delete Project"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined style={{ fontSize: "10px", color: "#fff" }} />}
    >
      <p>
        Are you sure you want to delete <strong>{project?.name}</strong>?
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onConfirm(project._id)}
          style={{ backgroundColor: "#2980b9", color: "#fff" }}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
};
export default ConfirmDeleteModal;
