import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchSpotById } from '../../store/spot';
import { fetchReviews } from '../../store/review';
import OpenModalButton from '../OpenModalButton';
import styles from './SpotDetail.module.css'; // Import CSS module
// import { MdStarRate } from 'react-icons/md';
import { LuDot } from 'react-icons/lu';
import ReviewFormModal from './ReviewFormModal';
import DeleteReviewModal from './DeleteReviewModal';
import ReserveFeatureModal from './ReserveFeatureModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function SpotDetail() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots.Spots[spotId]);
  const reviews = useSelector((state) => state.reviews.reviews);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(fetchSpotById(spotId));
    dispatch(fetchReviews(spotId));
  }, [dispatch, spotId]);

  const handleReviewSubmit = () => {
    // Re-fetch both reviews and spot details after posting a review
    dispatch(fetchSpotById(spotId));
    dispatch(fetchReviews(spotId));
  };

  if (!spot) return <div>Loading...</div>;

  return (
    <div className={styles.spotDetailsOuterContainer}>

    <div className={styles.spotDetailsContainer}>
      <h2 className={styles.spotTitle}>{spot.name}</h2>
      <h3 className={styles.spotLocation}>
        {spot.city}, {spot.state}, {spot.country}
      </h3>

      <div className={styles.spotImagesContainer}>
        {spot.SpotImages && spot.SpotImages.length > 0 ? (
          <>
            <img src={spot.SpotImages[0].url} alt="Spot Preview" className={styles.previewImage} />
            <div className={styles.smallerImages}>
              {spot.SpotImages.slice(1).map((image, idx) => (
                <img key={idx} src={image.url} alt={`Spot Image ${idx + 1}`} className={styles.spotImage} />
              ))}
            </div>
          </>
        ) : (
          <p>No images available</p>
        )}
      </div>

      <div className={styles.descriptionPriceContainer}>
        <div className={styles.descriptionContainer}>
          <h3>Hosted by {spot.Owner ? `${spot.Owner.firstName} ${spot.Owner.lastName}` : 'Unknown'}</h3>
          <p className={styles.spotDescription}>{spot.description}</p>
        </div>

        <div className={styles.priceContainer}>
          <div className={styles.priceDetails}>
            <h3>${spot.price} Night</h3>

            {spot.avgStarRating && Object.values(reviews).length > 0 && !isNaN(Number(spot.avgStarRating)) ? (
              <div>
                <FontAwesomeIcon icon={faStar} className={styles.customStar} />
                {Number(spot.avgStarRating).toFixed(2)} <LuDot />
                {Object.values(reviews).length} review{Object.values(reviews).length !== 1 ? 's' : ''}
              </div>
            ) : (
              <div><FontAwesomeIcon icon={faStar} className={styles.customStar} /> New</div>
            )}
          </div>

          <OpenModalButton
            buttonText="Reserve"
            buttonClassName={styles.reserveButton}
            modalComponent={<ReserveFeatureModal />}
          />
        </div>
      </div>

      <hr />

      <div className={styles.reviewsContainer}>
  {/* <h3>Reviews</h3> */}

  {/* Star Rating and Review Count */}
  {spot.avgStarRating && Object.values(reviews).length > 0 && !isNaN(Number(spot.avgStarRating)) ? (
    <div className={styles.reviewSummary}>
      <FontAwesomeIcon icon={faStar} className={styles.customStar} />
      {Number(spot.avgStarRating).toFixed(2)} <LuDot />
      {Object.values(reviews).length} review{Object.values(reviews).length !== 1 ? 's' : ''}
    </div>
  ) : (
    <div className={styles.reviewSummary}>
      <FontAwesomeIcon icon={faStar} className={styles.customStarTwo} /> <span className={styles.newText}>New</span>
    </div>
  )}

  {/* Post Review Button */}
  {!Object.values(reviews).some(review => review.userId === sessionUser?.id) &&
    sessionUser && sessionUser.id !== spot.ownerId && (
      <OpenModalButton
        buttonText="Post Your Review"
        buttonClassName={styles.postReviewButton}
        modalComponent={<ReviewFormModal spotId={spotId} onReviewSubmit={handleReviewSubmit} />}
      />
  )}

  {/* Review List */}
  {reviews && Object.values(reviews).length > 0 ? (
    Object.values(reviews)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((review) => (
        <div key={review.id} className={styles.reviewCard}>
          <div className={styles.reviewerName}>{review.User?.firstName || "Anonymous"}</div>
          <div className={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </div>
          <div className={styles.reviewText}>{review.review}</div>
          {sessionUser && sessionUser.id === review.userId && (
            <OpenModalButton
              buttonText="Delete"
              buttonClassName={styles.deleteReviewButton}
              modalComponent={<DeleteReviewModal reviewId={review.id} spotId={spotId} />}
            />
          )}
        </div>
      ))
  ) : (
    <p className={styles.firstReviewText}>Be the first to post a review</p>
  )}
</div>

    </div>
    </div>
  );
}

  export default SpotDetail;
