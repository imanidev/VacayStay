import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addReview } from '../../store/review';
import useModal from '../../context/useModal';
import styles from './ReviewFormModal.module.css';

function ReviewFormModal({ spotId, onReviewSubmit }) {
  const [reviewText, setReviewText] = useState('');
  const [stars, setStars] = useState(0);
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addReview({ review: reviewText, stars, spotId: Number(spotId) }))
      .then(() => {
        onReviewSubmit();
        closeModal();
      });
  };

  // Close the modal when clicking outside of it
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains(styles.modalBackground)) {
      closeModal();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div className={styles.reviewFormModal}>
        <h2>How was your stay?</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            placeholder="Leave your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          />
          <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={styles.star}
                onClick={() => setStars(num)}
              >
                {stars >= num ? '★' : '☆'}
              </span>
            ))}
          </div>

          <div className={styles.buttonContainer}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={stars === 0 || reviewText.length < 10}
          >
            Submit Your Review
          </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReviewFormModal;
