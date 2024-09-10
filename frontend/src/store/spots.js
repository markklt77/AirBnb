import { csrfFetch } from '../store/csrf';

// Action Types
const SET_SPOTS = 'SET_SPOTS';
const SET_SINGLE_SPOT = 'SET_SINGLE_SPOT';
const ADD_SPOT = 'ADD_SPOT';
const SET_USER_SPOTS = 'spots/SET_USER_SPOTS';
const UPDATE_SPOT = 'UPDATE_SPOT';
const DELETE_SPOT = 'DELETE_SPOT';

// Action Creators
const setSpots = (spots) => ({
  type: SET_SPOTS,
  spots
});

const setSingleSpot = (spot) => ({
    type: SET_SINGLE_SPOT,
    spot
  });

const addSpot = (spot) => ({
    type: ADD_SPOT,
    spot
})

const setUserSpots = (spots) => ({
    type: SET_USER_SPOTS,
    spots
  });

const updateSpotAction = (spot) => ({
    type: UPDATE_SPOT,
    spot
});

const deleteSpotAction = (spotId) => ({
    type: DELETE_SPOT,
    spotId
  });


// Thunk Action Creator for all spots
export const fetchSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots');
    const data = await response.json();
    dispatch(setSpots(data.Spots));
};

//Thunk Action Creator for a single spot
export const fetchSpot = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${id}`)
    const data = await response.json();
    dispatch(setSingleSpot(data))
}

//Thunk Action Creator to add a new spot
export const createSpot = (spotData) => async (dispatch) => {

    console.log('Spot Data:', spotData);

    const response = await csrfFetch('/api/spots', {
        method: 'POST',
        body: JSON.stringify(spotData),
    });

    if (response.ok) {
        const newSpot = await response.json();
        dispatch(addSpot(newSpot));
        return newSpot;
    } else {
        const error = await response.json();
        throw new Error(error.message)
    }
}

//Thunk Action Creator to add Images to a Spot
export const uploadSpotImages = (spotId, imageObjects) => async (dispatch) => {
    try {
        for (const { url, preview } of imageObjects) {
            const response = await csrfFetch(`/api/spots/${spotId}/images`, {
                method: 'POST',
                body: JSON.stringify({ url, preview })
            });

            if (!response.ok) {
                throw new Error("Failed to upload image");
            }
        }

        return "Images uploaded successfully";

    } catch (error) {
        console.error("Error uploading images:", error);
        throw error;
    }
}

//Thunk action to fetch user spots
export const fetchUserSpots = () => async (dispatch) => {
    try {
      const response = await csrfFetch('/api/spots/current');
      const data = await response.json();
      dispatch(setUserSpots(data.Spots));
    } catch (error) {
      console.error('Error fetching user spots:', error);
    }
  };



//Thunk action to update a spot
export const updateSpot = (spotId, spotData) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/spots/${spotId}`, {
            method: 'PUT',
            body: JSON.stringify(spotData),
        });

        if (response.ok) {
            const updatedSpot = await response.json();
            dispatch(updateSpotAction(updatedSpot));
            return updatedSpot;
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Error updating spot:', error);
        throw error;
    }
};

//Thunk action to delete a spot
export const deleteSpot = (spotId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/spots/${spotId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            dispatch(deleteSpotAction(spotId));
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Error deleting spot:', error);
        throw error;
    }
};

const initialState = {
    spots: [],
    spot: null,
  };

  const spotReducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_SPOTS:
        return {
          ...state,
          spots: action.spots
        };
      case SET_SINGLE_SPOT:
        return {
          ...state,
          spot: action.spot
        };
      case ADD_SPOT:
        return {
            ...state,
            spots: [...state.spots, action.spot]
        };
      case SET_USER_SPOTS:
        return {
          ...state,
          userSpots: action.spots
        };
      case UPDATE_SPOT:
        return {
            ...state,
            spots: state.spots.map(spot =>
                spot.id === action.spot.id ? action.spot : spot
            ),
            spot: action.spot
        };
     case DELETE_SPOT:
        return {
            ...state,
            spots: state.spots.filter(spot => spot.id !== action.spotId),
        };
      default:
        return state;
    }
  };

  export default spotReducer;
