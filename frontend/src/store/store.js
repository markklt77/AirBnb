import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';

const rootReducer = combineReducers({
  session: sessionReducer
});


// Define a simple test reducer
// const initialState = { message: '' };

// const testReducer = (state = initialState, action) => {
//   console.log('Reducer received action:', action);
//   switch (action.type) {
//     case 'hello':
//       return { ...state, message: 'Hello, Redux!' };
//     default:
//       return state;
//   }
// };


let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}




const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
