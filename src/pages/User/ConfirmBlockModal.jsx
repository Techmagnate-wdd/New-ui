import { Modal, Button } from "react-bootstrap";

const ConfirmBlockModal = ({ isOpen, onClose, onConfirm, user }) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {user?.isActive ? "Confirm Block" : "Confirm Unblock"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Are you sure you want to {user?.isActive ? "block" : "unblock"}{" "}
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
        <Button variant="danger" onClick={() => onConfirm(user._id)}>
          {user?.isActive ? "Block" : "Unblock"}{" "}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmBlockModal;
