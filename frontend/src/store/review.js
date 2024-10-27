import { csrfFetch } from './csrf';

const LOAD_REVIEWS = 'reviews/LOAD_REVIEWS';
const ADD_REVIEW = 'reviews/ADD_REVIEW';
const DELETE_REVIEW = 'reviews/DELETE_REVIEW';

// Initial state
const initialState = {
  reviews: {},
};

// Action creators
const loadReviews = (reviews) => ({
  type: LOAD_REVIEWS,
  reviews,
});

const addReviewAction = (review) => ({
  type: ADD_REVIEW,
  review,
});

const deleteReviewAction = (reviewId) => ({
  type: DELETE_REVIEW,
  reviewId,
});

// Thunk to delete a review
export const deleteReview = (reviewId) => async (dispatch) => {
  const res = await csrfFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });

  if (res.ok) {
    dispatch(deleteReviewAction(reviewId));
  } else {
    const errorData = await res.json();
    console.error("Error deleting review:", errorData);
  }
};

// Thunk to fetch reviews for a specific spot
export const fetchReviews = (spotId) => async (dispatch) => {
  const res = await csrfFetch(`/api/spots/${spotId}/reviews`);
  if (res.ok) {
    const reviews = await res.json();
    console.log("Fetched reviews data:", reviews);
    dispatch(loadReviews(reviews));
  }
};


export const addReview = (reviewData) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${reviewData.spotId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: reviewData,
    });

    if (res.ok) {
      const review = await res.json();
      dispatch(addReviewAction(review));
    } else {
      const errorData = await res.json();
      console.error("Error adding review:", errorData);
    }
  };


// Reducer function
export default function reviewReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_REVIEWS: {
      const newState = { ...state, reviews: {} };

      // Handle cases where the reviews might be nested
      const reviewsArray = Array.isArray(action.reviews)
        ? action.reviews
        : action.reviews.Reviews;

      reviewsArray.forEach((review) => {
        newState.reviews[review.id] = review;
      });
      return newState;
    }

    case ADD_REVIEW: {
      return {
        ...state,
        reviews: {
          ...state.reviews,
          [action.review.id]: action.review,
        },
      };
    }

    case DELETE_REVIEW: {
      const newState = { ...state };
      delete newState.reviews[action.reviewId];
      return newState;
    }

    default:
      return state;
  }
}
