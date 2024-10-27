import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Make sure this is imported
import { useDispatch, useSelector } from "react-redux";
import OpenModalButton from '../OpenModalButton';
import DeleteSpotModal from "./DeleteSpotModal";
import { getCurrentUserSpots } from "../../store/spot";
import EditSpotModal from './EditSpotModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import styles from './ManageSpotsPage.module.css';

const ManageSpotsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userSpots = useSelector((state) => state.spots.UserSpots);

  useEffect(() => {
    dispatch(getCurrentUserSpots());
  }, [dispatch]);

  // Function to navigate to CreateSpotForm
  const handleCreateNewStay = () => {
    navigate('/create-spot');
  };

  return (
    <div className={styles.manageSpotsPageContainer}>
      <div className={styles.ManageTitleContainer}>
        <h1>Manage Spots</h1>

        {/* Create a New Stay Button */}
        <div className={styles.createNewStayContainer}>
          <button className={styles.createNewStayButton} onClick={handleCreateNewStay}>
            Create a new spot
          </button>
          {(!userSpots || Object.keys(userSpots).length === 0) && (
          <div className={styles.noSpotsMessage}>No spots available</div>
  )}

        </div>
      </div>

      <div className={styles.spotsContainer}>


          <div className={styles.manageAllSpotsContainer}>
            {Object.values(userSpots).map((spot) => {
              const previewImage = spot.previewImage || "/path_to_placeholder_image.jpg";

              return (
                <div key={spot.id} className={styles.manageSpotCard}>
                  <img
                    src={previewImage}
                    alt={spot.name}
                    className={styles.manageSpotImage}
                    onClick={() => navigate(`/spots/${spot.id}`)}
                    style={{ cursor: 'pointer' }}
                  />

                  {/* Spot Info */}
                  <div className={styles.spotInfo}>
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

                  <p className={styles.spotPrice}>${spot.price} Night</p>

                  <div className={styles.manageSpotActions}>
                  <OpenModalButton
                      buttonText="update"
                      buttonClassName={styles.manageEditButton}
                      modalComponent={<EditSpotModal spot={spot} navigate={navigate} />}
                    />
                    <OpenModalButton
                      buttonText="delete"
                      buttonClassName={styles.manageDeleteButton}
                      modalComponent={<DeleteSpotModal spotId={spot.id} />}
                    />
                  </div>
                </div>
              );
            })}
          </div>

      </div>
    </div>
  );
};

export default ManageSpotsPage;
