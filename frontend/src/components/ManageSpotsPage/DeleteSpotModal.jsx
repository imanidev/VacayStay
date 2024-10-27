import { useDispatch } from "react-redux";
import { removeSpot, getCurrentUserSpots } from '../../store/spot';
import useModal from '../../context/useModal';
import styles from './DeleteSpotModal.module.css';

const DeleteSpotModal = ({ spotId }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDelete = async () => {
    await dispatch(removeSpot(spotId));
    await dispatch(getCurrentUserSpots());
    closeModal();
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains(styles.modalBackground)) {
      closeModal();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <h1 className={styles.heading}>Confirm Delete</h1>
        <p className={styles.warningText}>Are you sure you want to delete this spot?</p>
        <div className={styles.buttonContainer}>
          <button onClick={handleDelete} className={styles.confirmButton}>
            Yes (Delete Spot)
          </button>
          <button onClick={closeModal} className={styles.cancelButton}>
            No (Keep Spot)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSpotModal;
