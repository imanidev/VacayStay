// frontend/src/components/DeleteSpotButton/DeleteSpotButton.jsx

import { useDispatch } from 'react-redux';
import { removeSpot } from '../../store/spot';

function DeleteSpotButton({ spotId }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(removeSpot(spotId));
  };

  return <button onClick={handleDelete}>Delete Spot</button>;
}

export default DeleteSpotButton;
