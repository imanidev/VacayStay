import { csrfFetch } from './csrf';

// Action Types
const LOAD_SPOTS = 'spots/LOAD_SPOTS';
const SET_USER_SPOTS = 'spots/SET_USER_SPOTS';
const ADD_SPOT = 'spots/ADD_SPOT';
const UPDATE_SPOT = 'spots/UPDATE_SPOT';
const DELETE_SPOT = 'spots/DELETE_SPOT';
const ADD_IMAGE = 'spots/ADD_IMAGE';

// Action Creators
const loadSpots = (spots) => ({
  type: LOAD_SPOTS,
  spots,
});

const addSpot = (spot) => ({
  type: ADD_SPOT,
  spot,
});

const updateSpotAction = (spot) => ({
  type: UPDATE_SPOT,
  spot,
});

const deleteSpot = (spotId) => ({
  type: DELETE_SPOT,
  spotId,
});

const addImage = (image) => {
  return {
    type: ADD_IMAGE,
    image
  }
}


// Thunks for asynchronous actions
// export const fetchSpots = () => async (dispatch) => {
//   const response = await fetch('/api/spots');
//   if (response.ok) {
//     const data = await response.json();
//     dispatch(loadSpots(data.spots));
//   }
// };

export const fetchSpots = () => async (dispatch) => {
  const response = await fetch('/api/spots');
  if (response.ok) {
    const data = await response.json();

    // Log the data to verify
    console.log("Fetched spots data:", data);

    // Ensure that the correct path is accessed (data.Spots)
    if (Array.isArray(data.Spots)) {
      dispatch(loadSpots(data.Spots)); // Dispatch the correct array of spots
    } else {
      console.error("Spots data is not in the expected array format:", data.Spots);
    }
  } else {
    console.error("Failed to fetch spots");
  }
};



// store/spot.js
export const createSpot = (spot) => async (dispatch) => {
  const { address, city, state, country, lat, lng, name, description, price } = spot;

  console.log("Creating Spot with Data:", { address, city, state, country, lat, lng, name, description, price });

  try {
    const response = await csrfFetch('/api/spots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {  // Pass as a plain object
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error Data:", errorData);
      throw new Error("Failed to create spot");
    }

    const newSpot = await response.json();
    dispatch(addSpot(newSpot));
    return newSpot;
  } catch (error) {
    console.error("Request failed:", error);
    return { errors: error.message };
  }
};



export const postSpotImage = (image) => async (dispatch) => {
  const { spotId, url, preview } = image;

  try {
    const res = await csrfFetch(`/api/spots/${spotId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { url, preview }, // Pass as a plain object
    });

    if (!res.ok) throw res;

    const data = await res.json();
    dispatch(addImage(data));

    return data;
  } catch (error) {
    const errorData = await error.json();
    console.error("Image Upload Error:", errorData);
    return { errors: errorData.errors || "An error occurred during the image upload." };
  }
};



export const editSpot = (spot) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spot.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: spot,  // Pass as plain object instead of stringifying
  });

  if (response.ok) {
    const updatedSpot = await response.json();
    dispatch(updateSpotAction(updatedSpot));  // Dispatch the action to update the store
    return updatedSpot;
  } else {
    const errorData = await response.json();
    console.error("Error updating spot:", errorData);
    return { errors: errorData.errors };
  }
};


export const fetchSpotById = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`);
  if (response.ok) {
    const spot = await response.json();
    dispatch(addSpot(spot));
    return spot;
  } else {
    console.error('Failed to fetch spot');
    return null;
  }
};

export const removeSpot = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    dispatch(deleteSpot(spotId));
  } else {
    const errorData = await response.json();
    console.error("Error deleting spot:", errorData);
  }
};



export const getCurrentUserSpots = () => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/current`);

  if (response.ok) {
    const data = await response.json();
    console.log("Fetched user spots data:", data);


    dispatch({
      type: SET_USER_SPOTS,
      spots: data.Spots || [],
    });
  }
};

export const updateSpotThunk = (updatedSpot, previewImage, imageUrls) => async (dispatch) => {
  try {
    // Update spot details first
    const response = await csrfFetch(`/api/spots/${updatedSpot.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: updatedSpot, // Stringify is Evil
    });

    if (response.ok) {
      const spot = await response.json();
      console.log('Updated spot:', spot);

      // Dispatch the action to update the spot in the Redux store
      dispatch(updateSpotAction(spot));

      // Handle preview image update if changed
      if (previewImage && previewImage !== spot.previewImage) {
        await csrfFetch(`/api/spots/${spot.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { url: previewImage, preview: true }, // No JSON.stringify
        });
      }

      // Handle other image updates if provided
      if (imageUrls && imageUrls.length > 0) {
        const imagePromises = imageUrls.map((url) =>
          csrfFetch(`/api/spots/${spot.id}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { url, preview: false }, // No JSON.stringify
          })
        );
        await Promise.all(imagePromises);
      }

      return spot; // Return updated spot
    } else {
      const error = await response.json();
      console.error('Error updating spot:', error);
      throw error;
    }
  } catch (err) {
    console.error('Update spot thunk failed:', err);
  }
};


// Initial State
const initialState = {
  Spots: {},
  UserSpots: {},
};

// Reducer
export default function spotReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_SPOTS: {
      const newState = { ...state, Spots: {} };
      action.spots.forEach((spot) => {
        newState.Spots[spot.id] = spot;
      });
      return newState;
    }


    case SET_USER_SPOTS: {
      const newState = { ...state, UserSpots: {} };

      // Ensure action.spots is an array before using forEach
      if (Array.isArray(action.spots) && action.spots.length > 0) {
        action.spots.forEach((spot) => {
          newState.UserSpots[spot.id] = spot;
        });
      } else {
        console.log("action.spots is either undefined or empty:", action.spots);
      }

      return newState;
    }

    case ADD_SPOT: {
      return {
        ...state,
        Spots: {
          ...state.Spots,
          [action.spot.id]: action.spot,  // Add spot to global spots
        },
        UserSpots: {
          ...state.UserSpots,
          [action.spot.id]: action.spot,  // Add to user's spots as well
        },
      };
    }

    case UPDATE_SPOT: {
      return {
        ...state,
        Spots: {
          ...state.Spots,
          [action.spot.id]: action.spot,  // Update spot globally
        },
        UserSpots: {
          ...state.UserSpots,
          [action.spot.id]: action.spot,  // Update user-specific spot
        },
      };
    }

    case DELETE_SPOT: {
      const newState = { ...state };
      delete newState.Spots[action.spotId];  // Delete globally
      delete newState.UserSpots[action.spotId];  // Delete from user's spots
      return newState;
    }


    case ADD_IMAGE: {
      const spot = state.Spots[action.image.spotId];
      if (!spot) return state;  // If the spot doesn't exist, return the current state

      return {
        ...state,
        Spots: {
          ...state.Spots,
          [action.image.spotId]: {
            ...spot,
            images: [...(spot.images || []), action.image],  // Add image to spot's images
          },
        },
      };
    }

    default:
      return state;
  }
}
