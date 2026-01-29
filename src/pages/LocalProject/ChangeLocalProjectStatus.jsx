// ChangeProjectStatus.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ChangeProjectStatus = ({ show, handleClose, handleSave, task }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Delete Project
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Are you sure, you want to delete <b>{task?.project_name}</b></p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => handleSave(task?._id)}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeProjectStatus;


