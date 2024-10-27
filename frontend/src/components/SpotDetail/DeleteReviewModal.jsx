import { useDispatch } from 'react-redux';
import { deleteReview, fetchReviews } from '../../store/review';  // Update path as needed
import useModal from '../../context/useModal';
import styles from './DeleteReviewModal.module.css';

function DeleteReviewModal({ reviewId, spotId }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const handleDelete = () => {
        dispatch(deleteReview(reviewId, spotId))
            .then(() => {
                dispatch(fetchReviews(spotId));
                closeModal();
            });
    };

    // Close modal when clicking outside of modal content
    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modalBackground)) {
            closeModal();
        }
    };

    return (
        <div className={styles.modalBackground} onClick={handleClickOutside}>
            <div className={styles.modalContent}>
                <h2 className={styles.heading}>Confirm Delete</h2>
                <p className={styles.warningText}>Are you sure you want to delete this review?</p>
                <div className={styles.buttonContainer}>
                    <button onClick={handleDelete} className={styles.confirmButton}>
                        Yes (Delete Review)
                    </button>
                    <button onClick={closeModal} className={styles.cancelButton}>
                        No (Keep Review)
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteReviewModal;
