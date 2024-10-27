// frontend/src/components/EditSpotForm/EditSpotForm.jsx

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editSpot } from '../../store/spot';

function EditSpotForm({ spotId }) {
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots[spotId]);
  const [name, setName] = useState(spot?.name || '');
  const [location, setLocation] = useState(spot?.location || '');

  useEffect(() => {
    if (spot) {
      setName(spot.name);
      setLocation(spot.location);
    }
  }, [spot]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(editSpot({ id: spotId, name, location }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Spot</h2>
      <label>
        Name:
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Location:
        <input value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <button type="submit">Update Spot</button>
    </form>
  );
}

export default EditSpotForm;
