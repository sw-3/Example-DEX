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

		default:
			return state
	}
}

// 'tokens' reducer
//		handles dispatched actions related to the token smart contract
//-----------------------------------------------------------------------------
export const tokens = (state = { loaded: false, contract: null }, action) => {
	switch (action.type) {
		case 'TOKEN_LOADED':
			return {
				...state,
				loaded: true,
				contract: action.token,
				symbol: action.symbol
			}

		default:
			return state
	}
}
