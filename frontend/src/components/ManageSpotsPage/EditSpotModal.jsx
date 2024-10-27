import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateSpotThunk, getCurrentUserSpots } from '../../store/spot';
import useModal from '../../context/useModal';
import styles from './EditSpotModal.module.css';
import { csrfFetch } from '../../store/csrf';

const EditSpotModal = ({ spot, navigate }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [address, setAddress] = useState(spot.address || '');
  const [city, setCity] = useState(spot.city || '');
  const [state, setState] = useState(spot.state || '');
  const [country, setCountry] = useState(spot.country || '');
  const [lat, setLat] = useState(spot.lat || '');
  const [lng, setLng] = useState(spot.lng || '');
  const [description, setDescription] = useState(spot.description || '');
  const [name, setName] = useState(spot.name || '');
  const [price, setPrice] = useState(spot.price || '');
  const [previewImage, setPreviewImage] = useState(spot.previewImage || '');
  const [imageUrls, setImageUrls] = useState(spot.imageUrls || []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedSpot = {
      ...spot,
      address,
      city,
      state,
      country,
      lat,
      lng,
      description,
      name,
      price,
    };

    await dispatch(updateSpotThunk(updatedSpot));
    const imageUpdatePromises = [];

    if (previewImage !== spot.previewImage) {
      imageUpdatePromises.push(
        csrfFetch(`/api/spots/${spot.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { url: previewImage, preview: true },
        })
      );
    }

    imageUrls.forEach((url, index) => {
      if (url && url !== spot.imageUrls[index]) {
        imageUpdatePromises.push(
          csrfFetch(`/api/spots/${spot.id}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { url, preview: false },
          })
        );
      }
    });

    await Promise.all(imageUpdatePromises);
    await dispatch(getCurrentUserSpots());

    closeModal();
    navigate(`/spots/${spot.id}`);
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains(styles.modalBackground)) {
      closeModal();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <h1 className={styles.heading}>Update Your Spot</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Address
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            City
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            State
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Country
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Latitude
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Longitude
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Price
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Preview Image URL
            <input
              type="text"
              value={previewImage}
              onChange={(e) => setPreviewImage(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          {imageUrls.map((url, index) => (
            <label key={index} className={styles.label}>
              Image URL {index + 1}
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  const updatedImageUrls = [...imageUrls];
                  updatedImageUrls[index] = e.target.value;
                  setImageUrls(updatedImageUrls);
                }}
                className={styles.input}
              />
            </label>
          ))}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitButton}>
              Update Your Spot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSpotModal;
