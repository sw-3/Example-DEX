// store.js
// 		this file defines the data store for our blockchain data

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

/* Import Reducers */
import { provider, tokens } from './reducers'	// imports from our reducers.js file

const reducer = combineReducers({				// save all reducers in one
	provider,
	tokens
})

const initialState = {}							// initial state is empty

const middleware = [thunk]

// create the data store to hold the blockchain state + reducers
const store = createStore(
	reducer, 
	initialState, 
	composeWithDevTools(applyMiddleware(...middleware))	// allows access with Redux tools
)

export default store
