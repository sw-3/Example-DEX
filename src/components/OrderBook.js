import { useSelector } from 'react-redux'

// Import assets
import sort from '../assets/sort.svg'

// Import selectors
import { orderBookSelector } from '../store/selectors'

const OrderBook = () => {
  const symbols = useSelector(state => state.tokens.symbols)
  // use our custom selector from selectors.js
  const orderBook = useSelector(orderBookSelector)

  return (
    <div className="component exchange__orderbook">
      <div className='component__header flex-between'>
        <h2>Order Book</h2>
      </div>

      <div className="flex">

        {/* if no order book, or no sell orders exist, handle this first */}
        {!orderBook || orderBook.sellOrders.length === 0 ? (
          <p className='flex-center'>No Sell Orders</p>
        ) : (
          <table className='exchange__orderbook--sell'>
            <caption>Selling</caption>

            {/* HEADING FOR SELL ORDERS... */}
            <thead>
              <tr>
                <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              </tr>
            </thead>

            {/* DISPLAY SELL ORDERS (USE MAPPING)... */}

            <tbody>
              {orderBook && orderBook.sellOrders.map((order, index) => {
                return(
                  <tr key={index}>
                    <td>{order.token0Amount}</td>
                    <td style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</td>
                    <td>{order.token1Amount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <div className='divider'></div>

        {!orderBook || orderBook.buyOrders.length === 0 ? (
          <p className='flex-center'>No Buy Orders</p>
        ) : (
          <table className='exchange__orderbook--buy'>
            <caption>Buying</caption>
            <thead>
              <tr>
                <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              </tr>
            </thead>
            <tbody>

              {/* DISPLAY BUY ORDERS (USE MAPPING)... */}
              
              {orderBook && orderBook.buyOrders.map((order, index) => {
                return(
                  <tr key={index}>
                    <td>{order.token0Amount}</td>
                    <td style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</td>
                    <td>{order.token1Amount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

export default OrderBook;
