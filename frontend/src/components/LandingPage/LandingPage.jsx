import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots } from '../../store/spot';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import styles from './LandingPage.module.css';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const spots = useSelector((state) => state.spots.Spots);

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  if (!spots || Object.keys(spots).length === 0) {
    return (
      <div className={styles.noSpotsContainer}>
        <div className={styles.noSpotsMessage}>No spots available</div>
      </div>
    );
  }

  const handleImageClick = (spotId) => {
    navigate(`/spots/${spotId}`);
  };

  return (
    <div className={styles.landingPageContainer}>
      <div className={styles.allSpotsContainer}>
        {Object.values(spots).map((spot) => {
          const previewImage = spot.previewImage || '/path_to_placeholder_image.jpg';
          return (
            <div
              key={spot.id}
              className={styles.spotCard}
              onClick={() => handleImageClick(spot.id)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={previewImage}
                alt={spot.name}
                className={styles.spotImage}
              />
              <span className={styles.tooltip}>{spot.name}</span>

              <div className={styles.spotInfoContainer}>
                <p className={styles.spotLocation}>{spot.city}, {spot.state}</p>
                <p className={styles.spotRating}>
                  <FontAwesomeIcon icon={faStar} />
                  {spot.avgRating && !isNaN(Number(spot.avgRating)) ? (
                    Number(spot.avgRating).toFixed(1)
                  ) : (
                    "New"
                  )}
                </p>
              </div>

              <div className={styles.spotPrice}>
                <p>${spot.price} Night</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LandingPage;
