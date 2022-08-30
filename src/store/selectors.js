// selectors.js
// store the complex selector functions

// Reselect: library for creating memoized selector functions.
import { createSelector } from 'reselect'	// see Note below on createSelector
// Lodash: helper library for working with arrays, numbers, objects, strings, etc
import { get, groupBy, reject, maxBy, minBy } from 'lodash'
// Moment: helper library for working with & formatting date-timestamps
import moment from 'moment'
import { ethers } from 'ethers'

// define some CSS hex colors for use on the screen
const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
// functions to return various stuff when passed the state
// these order types are loaded when the exchange is launched (??)
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

// openOrders
// function to filter out Cancelled and Filled orders, to get "open" orders
const openOrders = state => {
	const all = allOrders(state)
	const filled = filledOrders(state)
	const cancelled = cancelledOrders(state)

	// Lodash function "reject" to remove the Cancelled and Filled orders from all
	const openOrders = reject(all, (order) => {
		// in-line function:
		// 		iterate filled/cancelled orders and look for a match on ID in all orders
		//		return any matches to the "reject" function to reject them
		//		Note: the next 2 lines both return a boolean
		// 		Note: need to look up docs on "some" ??
		const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
		const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())

		// whatever is returned here, gets "rejected!"
		return(orderFilled || orderCancelled)
	})

	return openOrders
}

// decorateOrder
// 		formats basic Order information for display in the UI
const decorateOrder = (order, tokens) => {
	let token0Amount, token1Amount

	// Example: DApp should be considered token0, mETH is considered token1
	// 			Giving mETH in exchange for DApp
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
	
	// Note: format the amounts with ethers.utils for ether (adds decimals)
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

// Note: createSelector Accepts one or more "input selectors" (either as separate arguments or 
// a single array), a single "output selector" / "result function", and an optional options 
// object, and generates a memoized selector function.
// When the selector is called, each input selector will be called with all of the provided 
// arguments. The extracted values are then passed as separate arguments to the output selector, 
// which should calculate and return a final result. The inputs and result are cached for later use.
export const orderBookSelector = createSelector(
	openOrders, 
	tokens, 
	(orders, tokens) => {
		// make sure we have both tokens loaded
		if (!tokens[0] || !tokens[1]) { return }

		// filter orders by selected tokens
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

		// Decorate orders
		orders = decorateOrderBookOrders(orders, tokens)

		// Lodash function, to group orders into separate arrays, by orderType
		orders = groupBy(orders, 'orderType')

		// Now we need to sort the buy and sell orders arrays by Price
		// fetch the 'buy' orders array
		const buyOrders = get(orders, 'buy', [])

		//sort buy orders by price, and add sorted "buyOrders" to the orders object
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
		}

		// fetch the 'sell' orders array
		const sellOrders = get(orders, 'sell', [])

		// sort sell orders in the same way
		orders = {
			...orders,
			sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
		}

		return orders
})

// decorateOrderBookOrders
// 		wrapper function, to format all selected OrderBook orders for display
// 		calls the basic "decorateOrder" and the specific "decorateOrderBookOrder"
const decorateOrderBookOrders = (orders, tokens) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateOrderBookOrder(order,tokens)
			return(order)
		})
	)
}

// decorateOrderBookOrder
// 		formats an order for display in the Order Book on the UI
const decorateOrderBookOrder = (order, tokens) => {
	const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

	// buy orders should be Green, and sell orders Red
	// store the actual CSS hex color value with the order
	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		// order "fill action" is opposite of the order type
		orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
	})
}

// -------------------------------------------------------------------------------------------
// PRICE CHART

// priceChartSelector
// 		Custom selector to prepare all display-related data for the candlestick chart
export const priceChartSelector = createSelector(
	filledOrders, 
	tokens, 
	(orders, tokens) => {
		// make sure we have both tokens loaded
		if (!tokens[0] || !tokens[1]) { return }

		// filter orders by selected tokens
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

		// sort orders by timestamp, ascending
		orders = orders.sort((a, b) => a.timestamp - b.timestamp)

		// decorate orders - add display attributes
		orders = orders.map((o) => decorateOrder(o, tokens))

		// get last 2 orders, to figure out whether last price was higher or lower
		let secondLastOrder, lastOrder
		[secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

		// Lodash 'get' does auto-check if lastOrder exists ... otherwise return the 0
		const lastPrice = get(lastOrder, 'tokenPrice', 0)
		const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

		return ({
			lastPrice,
			lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
			series: [{
				data: buildGraphData(orders)
			}]
		})
	}
)

// buildGraphData
// 		Put the chart data in the format needed for the charting library
const buildGraphData = (orders) => {

	// group orders by the date they were created
	// Note: group by 'day' for daily candlesticks... change to 'hour'
	//		to produce hourly candlesticks. (or visa-versa)
	orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

	// get the unique groupings (the specific hours or days, etc), for the 'x' value
	const hours = Object.keys(orders)

	// build the graph series
	const graphData = hours.map((hour) => {
		// fetch all orders from current hour
		const group = orders[hour]

		// calculate price values: open, high, low, close
		const open = group[0]						// first order
		const high = maxBy(group, 'tokenPrice') 	// Lodash function
		const low = minBy(group, 'tokenPrice')		// Lodash function
		const close = group[group.length - 1]		// last order

		return({
			x: new Date(hour),
			y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
		})
	})

	return graphData
}
