// src/components/ConfirmDeleteModal.jsx
import React from 'react';
import { Modal, Button, ModalTitle } from 'react-bootstrap';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, user }) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Are you sure you want to delete{' '}
          <strong>
            {user?.firstName} {user?.lastName}
          </strong>
          ?
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => onConfirm(user._id)}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;
