import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSpot, fetchSpots } from '../../store/spot';
import { useNavigate } from 'react-router-dom';
import { csrfFetch } from '../../store/csrf';

// Import the CSS module
import styles from './CreateSpotForm.module.css';

function CreateSpotForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrls, setImageUrls] = useState(['', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionUser = useSelector((state) => state.session.user);

  const handleImageUrlChange = (index, value) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value;
    setImageUrls(updatedUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessionUser) {
      setErrors({ user: "You must be logged in to create a spot." });
      return;
    }

    const validationErrors = {};
    if (!country) validationErrors.country = "Country is required";
    if (!address) validationErrors.address = "Address is required";
    if (!city) validationErrors.city = "City is required";
    if (!state) validationErrors.state = "State is required";
    if (description.length < 30) validationErrors.description = "Description needs a minimum of 30 characters";
    if (!name) validationErrors.name = "Name of your spot is required";
    if (!price || isNaN(parseFloat(price))) validationErrors.price = "Price must be a valid number";
    if (!lat || isNaN(parseFloat(lat))) validationErrors.lat = "Latitude must be a valid number";
    if (!lng || isNaN(parseFloat(lng))) validationErrors.lng = "Longitude must be a valid number";
    if (!imageUrls[0]) validationErrors.imageUrls = "Preview image is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    const newSpot = {
      address,
      city,
      state,
      country,
      lat: parsedLat,
      lng: parsedLng,
      name,
      description,
      price: parseFloat(price),
    };

    try {
      const createdSpot = await dispatch(createSpot(newSpot));
      if (createdSpot && createdSpot.id) {
        for (const url of imageUrls) {
          if (url) {
            await csrfFetch(`/api/spots/${createdSpot.id}/images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: { url, preview: true }, // Passing as a plain object
            });
          }
        }
        await dispatch(fetchSpots());
        navigate(`/spots/${createdSpot.id}`);
      }
    } catch (error) {
      console.error("Error creating spot or uploading images:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.createSpotsContainer}>
      <form onSubmit={handleSubmit} className={styles.createSpotForm}>
        <h2>Create A New Spot</h2>

        <p className={styles.formHeading}>Where&#39;s your place located?</p>
        <p className={styles.formSubtext}>Guests will only get your exact address once they book a reservation.</p>

        <label className={styles.labelForm}>
  <span>Country</span>
  <input
    type="text"
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    placeholder="Country"
  />
  {errors.country && <p className={styles.error}>{errors.country}</p>}
</label>

<label className={styles.labelForm}>
  <span>Street Address</span>
  <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    placeholder="Address"
  />
  {errors.address && <p className={styles.error}>{errors.address}</p>}
</label>

<div className={styles.formGroup}>
  <label className={styles.labelForm}>
    <span>City</span>
    <input
      type="text"
      value={city}
      onChange={(e) => setCity(e.target.value)}
      placeholder="City"
    />
    {errors.city && <p className={styles.error}>{errors.city}</p>}
  </label>

  <label className={styles.labelForm}>
    <span>State</span>
    <input
      type="text"
      value={state}
      onChange={(e) => setState(e.target.value)}
      placeholder="STATE"
    />
    {errors.state && <p className={styles.error}>{errors.state}</p>}
  </label>
</div>
        <div className={styles.formGroup}>
          <label className={styles.labelForm}>
            <span>Latitude</span>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="Latitude"
            />
            {errors.lat && <p className={styles.error}>{errors.lat}</p>}
          </label>

          <label className={styles.labelForm}>
            <span>Longitude</span>
            <input
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="Longitude"
            />
            {errors.lng && <p className={styles.error}>{errors.lng}</p>}
          </label>
        </div>

        <p className={styles.formHeading}>Describe your place to guests</p>
        <p className={styles.formSubtext}>Mention the best features of your space, any special amenities like fast WiFi or parking, and what you love about the neighborhood.</p>

        <label className={styles.labelForm}>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please write at least 30 characters"
          />
          {errors.description && <p className={styles.error}>{errors.description}</p>}
        </label>

        <p className={styles.formHeading}>Create a title for your spot</p>
        <p className={styles.formSubtext}>Catch guests&#39; attention with a spot title that highlights what makes your place special.</p>

        <label className={styles.labelForm}>
          <span>Name of your spot</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name of your spot"
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </label>

        <p className={styles.formHeading}>Set a base price for your spot</p>
        <p className={styles.formSubtext}>Competitive pricing can help your listing stand out and rank higher in search results.</p>

        <label className={styles.labelForm}>
          <span>Price per night (USD)</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price per night (USD)"
          />
          {errors.price && <p className={styles.error}>{errors.price}</p>}
        </label>

        <p className={styles.formHeading}>Liven up your spot with photos</p>
        <p className={styles.formSubtext}>Submit a link to at least one photo to publish your spot.</p>

        {imageUrls.map((url, index) => (
          <label key={index} className={styles.labelForm}>
            <span>{index === 0 ? 'Preview Image URL' : `Image URL ${index}`}</span>
            <input
              type="text"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              placeholder={index === 0 ? "Preview Image URL" : "Image URL"}
            />
            {errors.imageUrls && <p className={styles.error}>{errors.imageUrls}</p>}
            {errors.imageUrls && index === 1 && (
              <p className={styles.validation}>Image URL must end in .png, .jpg, or .jpeg</p>
            )}
          </label>
        ))}

        <div className={styles.buttonContainer} >

        <button type="submit" disabled={isSubmitting} className=
        {styles.createButton}>Create Spot</button>

        </div>

      </form>
    </div>
  );
}
   export default CreateSpotForm;
