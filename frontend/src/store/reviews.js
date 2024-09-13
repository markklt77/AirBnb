import { csrfFetch } from '../store/csrf';


//action types
const SET_REVIEWS_BY_ID = 'SET_REVIEWS_BY_ID'
const ADD_REVIEW = 'ADD_REVIEW';
const DELETE_REVIEW = 'DELETE_REVIEW';

// Action Creators
const setReviewsById = (reviews) => ({
    type: SET_REVIEWS_BY_ID,
    reviews
  });

const addReview = (review) => ({
type: ADD_REVIEW,
review,
});

const deleteReview = (reviewId) => ({
  type: DELETE_REVIEW,
  reviewId
});


//thunk actions
export const fetchReviewsById = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
    const data = await response.json();
    dispatch(setReviewsById(data.Reviews))
}


export const postReview = (spotId, reviewData) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });

    if (response.ok) {
      const newReview = await response.json();
      dispatch(addReview(newReview));
      return newReview;
    } else {
        console.log('There was a problem posting the review')
    }
  };

//thunk action to delete review
export const deleteReviewById = (reviewId) => async (dispatch) => {
  try {
      const response = await csrfFetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE'
      });

      if (response.ok) {
          dispatch(deleteReview(reviewId));

      } else {
          console.error('Failed to delete review');
      }
  } catch (error) {
      console.error('Error deleting review:', error);
  }
};

const initialState = {
    reviews: []
  };

const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_REVIEWS_BY_ID:
            return {
                ...state,
                reviews: action.reviews
            }
        case ADD_REVIEW:
            return {
                ...state,
                reviews: [...state.reviews, action.review]
            }
        case DELETE_REVIEW:
          return {
              ...state,
              reviews: state.reviews.filter(review => review.id !== action.reviewId)
          };
        default:
            return state;
    }
}

export default reviewReducer
