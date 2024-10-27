// frontend/src/components/SpotList/SpotList.jsx

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots } from '../../store/spot';

import DeleteSpotButton from '../DeleteSpotButton/DeleteSpotButton';

function SpotList() {
  const dispatch = useDispatch();
  const spots = useSelector((state) => Object.values(state.spots)); // Convert spots object to array

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  return (
<div>
      <h1>Available Spots</h1>
      <ul>
        {spots.map((spot) => (
          <li key={spot.id}>
            {spot.name} - {spot.location}
            <DeleteSpotButton spotId={spot.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpotList;
