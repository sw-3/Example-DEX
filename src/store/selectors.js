// selectors.js
// store the complex selector functions

import { createSelector } from 'reselect'	// need to look this up, what is last "callback functio0n" param?
import { get, groupBy, reject } from 'lodash'				// Lodash allows ???
import moment from 'moment'				// timestamp formatting
import { ethers } from 'ethers'

// define some CSS hex colors for use on the screen
const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
// functions to return various stuff when passed the state
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
	const all = allOrders(state)
	const filled = filledOrders(state)
	const cancelled = cancelledOrders(state)

	const openOrders = reject(all, (order) => {
		// in-line function:
		// 		iterate filled/cancelled orders and look for a match on ID in all orders
		//		return any matches to the "reject" function to reject them
		//		Note: the next 2 lines both return a boolean
		const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
		const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
		return(orderFilled || orderCancelled)
	})

	return openOrders
}

// decorateOrder
// formats the Order information for display in the UI
const decorateOrder = (order, tokens) => {
	let token0Amount, token1Amount

	// Note: DApp should be considered token0, mETH is considered token1
	// Example: Giving mETH in exchange for DApp
	if (order.tokenGive === tokens[1].address) {
		token0Amount = order.amountGive			// the amount of DApp we are giving
		token1Amount = order.amountGet			// the amount fo mETH we want...
	} else {
		token0Amount = order.amountGet			// the amount of DApp we want
		token1Amount = order.amountGive			// the amount of mETH we are giving...
	}

	// calculate token price to 5 decimal places
	const precision = 100000
	let tokenPrice = (token1Amount / token0Amount)
	tokenPrice = Math.round(tokenPrice * precision) / precision
	
	return ({
		...order,
		token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
		token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
		tokenPrice,
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
	})
}

// -------------------------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
	openOrders, 
	tokens, 
	(orders, tokens) => {
		if (!tokens[0] || !tokens[1]) { return }

		// filter orders by selected tokens
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

		// Decorate orders
		orders = decorateOrderBookOrders(orders, tokens)

		// grouop orders by orderType
		orders = groupBy(orders, 'orderType')

		// fetch the 'buy' orders array
		const buyOrders = get(orders, 'buy', [])

		//sort buy orders by price
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
		}

		// fetch the 'sell' orders array
		const sellOrders = get(orders, 'sell', [])

		// sort sell orders by price
		orders = {
			...orders,
			sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
		}

		return orders
})

// format all selected OrderBook orders for display in the UI
const decorateOrderBookOrders = (orders, tokens) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateOrderBookOrder(order,tokens)
			return(order)
		})
	)
}

// formats an order for display in the Order Book on the UI
const decorateOrderBookOrder = (order, tokens) => {
	const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
	})
}
