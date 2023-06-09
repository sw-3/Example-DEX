// reducers.js
// Reducers handle the various application Actions; they receive state data
//		from the blockchain, which has changed because of the Action, and they
//		update the internal Redux state within the web application.

// 'provider' reducer
//		handles dispatched actions related to the blockchain node connection
//-----------------------------------------------------------------------------
// Note: 'export' allows function to be imported/used in other files
// default state is an empty object when the reducer is created
export const provider = (state = {}, action) => {
	switch (action.type) {
		case 'PROVIDER_LOADED':
			return {
				...state,						// start with existing state...
				connection: action.connection	// add a new key to the state
			}
		case 'NETWORK_LOADED':
			return {
				...state,
				chainId: action.chainId
			}
		case 'ACCOUNT_LOADED':
			return {
				...state,
				account: action.account
			}

		case 'ETHER_BALANCE_LOADED':
			return {
				...state,
				balance: action.balance
			}

		default:
			return state
	}
}

// 'tokens' reducer
//		handles dispatched actions related to the token smart contract
//-----------------------------------------------------------------------------
const DEFAULT_TOKENS_STATE = {
	loaded: false,
	contracts: [],
	symbols: []
}

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
	switch (action.type) {
		case 'TOKEN_1_LOADED':
			return {
				...state,
				loaded: true,
				contracts: [action.token],
				symbols: [action.symbol]
			}
		case 'TOKEN_1_BALANCE_LOADED':
			return {
				...state,
				balances: [action.balance]
			}
		case 'TOKEN_2_LOADED':
			return {
				...state,
				loaded: true,
				contracts: [...state.contracts, action.token],
				symbols: [...state.symbols, action.symbol]
			}
		case 'TOKEN_2_BALANCE_LOADED':
			return {
				...state,
				balances: [...state.balances, action.balance]
			}

		default:
			return state
	}
}

const DEFAULT_EXCHANGE_STATE = {
	loaded: false,
	contract: {},
	transaction: { 
		isSuccessful: false 
	},
	allOrders: {
		loaded: false,
		data: []
	},
	cancelledOrders: {
		data: []
	},
	filledOrders: {
		data: []
	},
	events: []
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
	let index, data 

	switch (action.type) {
		case 'EXCHANGE_LOADED':
			return {
				...state,
				loaded: true,
				contract: action.exchange
			}

		// ------------------------------------------------------------------------------
		// ORDERS LOADED (CANCELLED, FILLED & ALL)

		case 'CANCELLED_ORDERS_LOADED':
			return {
				...state,
				cancelledOrders: {
					loaded: true,
					data: action.cancelledOrders
				}
			}
		case 'FILLED_ORDERS_LOADED':
			return {
				...state,
				filledOrders: {
					loaded: true,
					data: action.filledOrders
				}
			}
		case 'ALL_ORDERS_LOADED':
			return {
				...state,
				allOrders: {
					loaded: true,
					data: action.allOrders
				}
			}

		// ------------------------------------------------------------------------------
		// CANCEL ORDER CASES
		case 'ORDER_CANCEL_REQUEST':
			return {
				...state,
				transaction: {
					transactionType: 'Cancel',
					isPending: true,
					isSuccessful: false
				},
			}
		// update the state when a cancel has been successfully completed
		// Note: events is updated with the current event FIRST, in front of existing
		case 'ORDER_CANCEL_SUCCESS':
			return {
				...state,
				transaction: {
					transactionType: 'Cancel',
					isPending: false,
					isSuccessful: true
				},
				cancelledOrders: {
					...state.cancelledOrders,
					data: [
						...state.cancelledOrders.data,
						action.order
					]
				},
				events: [action.event, ...state.events]
			}
		// update the state when a Cancel has failed
		case 'ORDER_CANCEL_FAIL':
			return {
				...state,
				transaction: {
					transactionType: 'Cancel',
					isPending: false,
					isSuccessful: false,
					isError: true
				},
			}

		// ------------------------------------------------------------------------------
		// FILLING ORDERS
		case 'ORDER_FILL_REQUEST':
			return {
				...state,
				transaction: {
					transactionType: 'Fill Order',
					isPending: true,
					isSuccessful: false
				},
			}
		case 'ORDER_FILL_SUCCESS':
			// prevent duplicate orders
			// if order already exists, it's ID will be returned, else -1 is returned 
			index = state.filledOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())

			if(index === -1) {
				// new order; add to data
				data = [...state.filledOrders.data, action.order]
			} else {
				// found index of already-existing order; do not add to data
				data = state.filledOrders.data
			}

			// Note: events is updated with the current event FIRST, in front of existing
			return {
				...state,
				transaction: {
					transactionType: 'Fill Order',
					isPending: false,
					isSuccessful: true
				},
				filledOrders: {
					...state.filledOrders,
					data
				},
				events: [action.event, ...state.events]
			}
		// update the state when a Cancel has failed
		case 'ORDER_FILL_FAIL':
			return {
				...state,
				transaction: {
					transactionType: 'Fill Order',
					isPending: false,
					isSuccessful: false,
					isError: true
				},
			}

		// ------------------------------------------------------------------------------
		// BALANCE CASES

		case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
			return {
				...state,
				balances: [action.balance]
			}
		case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
			return {
				...state,
				balances: [...state.balances, action.balance]
			}

		// -----------------------------------------------------------------------------
		// TRANSFER CASES (DEPOSIT & WITHDRAWS)
		// set state variables when a transfer request has been made, but not completed

		case 'TRANSFER_REQUEST':
			return {
				...state,
				transaction: {
					transactionType: 'Transfer',
					isPending: true,
					isSuccessful: false
				},
				transferInProgress: true
			}
		// update the state when a transfer has been successfully completed
		// Note: events is updated with the current event FIRST, in front of existing
		case 'TRANSFER_SUCCESS':
			return {
				...state,
				transaction: {
					transactionType: 'Transfer',
					isPending: false,
					isSuccessful: true
				},
				transferInProgress: false,
				events: [action.event, ...state.events]
			}
		// update the state when a transfer has failed
		case 'TRANSFER_FAIL':
			return {
				...state,
				transaction: {
					transactionType: 'Transfer',
					isPending: false,
					isSuccessful: false,
					isError: true
				},
				transferInProgress: false
			}

		// -----------------------------------------------------------------------------
		// MAKING ORDERS CASES

		case 'NEW_ORDER_REQUEST':
			return {
				...state,
				transaction: {
					transactionType: 'New Order',
					isPending: true,
					isSuccessful: false
				},
			}
		// update the state when a transfer has been successfully completed
		// add the new Order data to the "allOrders" state item
		case 'NEW_ORDER_SUCCESS':
			// prevent duplicate orders
			// if order already exists, it's ID will be returned, else -1 is returned 
			index = state.allOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())

			if(index === -1) {
				// new order; add to data
				data = [...state.allOrders.data, action.order]
			} else {
				// found index of already-existing order; do not add to data
				data = state.allOrders.data
			}

			// Note: events is updated with the current event FIRST, in front of existing
			return {
				...state,
				allOrders: {
					...state.allOrders,
					data
				},
				transaction: {
					transactionType: 'New Order',
					isPending: false,
					isSuccessful: true
				},
				events: [action.event, ...state.events]
			}
		// update the state when a transfer has failed
		case 'NEW_ORDER_FAIL':
			return {
				...state,
				transaction: {
					transactionType: 'New Order',
					isPending: false,
					isSuccessful: false,
					isError: true
				},
			}

		default:
			return state
	}
}
