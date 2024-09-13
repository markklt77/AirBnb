import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './DeleteModal.css'

function DeleteModal({ entityId, entityType, deleteAction }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  // Function to handle the deletion based on the entity type
  const handleDelete = async () => {
    try {
      if (entityType === "Review") {
        deleteAction(entityId)
      } else {
        await dispatch(deleteAction(entityId));
      }

      closeModal();
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
    }
  };

  return (
    <div className="delete-modal">
      <h1>Confirm Delete</h1>
      {entityType === "Spot" && (
        <h2>Are you sure you want to remove this spot from the listings?</h2>
      )}
      {entityType === "Review" && (
        <h2>Are you sure you want to delete this review?</h2>
      )}
      <div className="modal-actions">
        <button onClick={handleDelete} className="yes-button">
          Yes
        </button>
        <button onClick={closeModal} className="no-button">
          No
        </button>
      </div>
    </div>
  );
}

export default DeleteModal;
