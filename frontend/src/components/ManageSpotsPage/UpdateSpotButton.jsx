
import { useNavigate } from 'react-router-dom';

const UpdateSpotButton = ({ spot }) => {
  const navigate = useNavigate();

  const handleEdit = () => {

    navigate(`/spots/${spot.id}/edit`);
  };

  return (
    <button onClick={handleEdit} className="update-spot-button">
      Edit
    </button>
  );
};

export default UpdateSpotButton;
