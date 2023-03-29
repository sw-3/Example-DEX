// useState allows saving the state of a react component (not necessarily global)
import { useState } from 'react'
import { useSelector } from 'react-redux'

// Lodash: helper library for working with arrays, numbers, objects, strings, etc
import { get, groupBy, reject, maxBy, minBy } from 'lodash'
// Moment: helper library for working with & formatting date-timestamps
import moment from 'moment'

// Apexcharts is a popular charting library
import Chart from 'react-apexcharts'
// pull in our Chart options
import { options, defaultSeries } from './PriceChart.config'

import { priceChartSelector } from '../store/selectors'

import Banner from './Banner'

// Import assets
import arrowDown from '../assets/down-arrow.svg'
import arrowUp from '../assets/up-arrow.svg'

const PriceChart = () => {
  // Note: useState() allows access to the React component state, for
  //    this Balance component.  (Not the Redux global state)

  // this var tracks the value of the candlestick interval selector on the page
  // set the var by using the 2nd as a function (Default is 1 minute)
  const [intervalSelection, setIntervalSelection] = useState(1)

  // get the account, symbols, etc from the state
  const account = useSelector(state => state.provider.account)
  const symbols = useSelector(state => state.tokens.symbols)

  // get the list of formatted orders for the Price Chart
  const priceChartOrders = useSelector(priceChartSelector)
  console.log(priceChartOrders && priceChartOrders)
  console.log(priceChartOrders && priceChartOrders.length)

  // buildGraphData
  //    Put the chart data in the format needed for the charting library
  const buildGraphData = (orders) => {
    // Note: use startOf('minute') to produce 1 minute candlesticks. This will be further 
    // modified to group by the interval selection in the PriceChart component

    // create a list of orders with times adjusted to the candlestick boundaries
    let graphOrders, secondsToSubtract
    graphOrders = orders.map((o) => {
      // change the timestamp of each order, to fall on the most recent candlestick boundary
      // note that intervalSelection is in minutes, and timestamp is in seconds
      secondsToSubtract = o.timestamp % (intervalSelection * 60)
      o.timestamp = o.timestamp - secondsToSubtract

      return(o)
    })

    // now groupBy the minutes, since they all fall on the boundaries
    graphOrders = groupBy(graphOrders, (o) => moment.unix(o.timestamp).startOf('minute').format())

    // get the unique groupings (the specific minute), for the 'x' value
    const minutes = Object.keys(graphOrders)

    // build the graph series
    const graphData = minutes.map((minute) => {
      // fetch all orders from current hour
      const group = graphOrders[minute]

      // calculate price values: open, high, low, close
      const open = group[0]           // first order
      const high = maxBy(group, 'tokenPrice')   // Lodash function
      const low = minBy(group, 'tokenPrice')    // Lodash function
      const close = group[group.length - 1]   // last order

      return({
        x: new Date(minute),
        y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
      })
    })

    return graphData
  }

  // group/format priceChartOrders as required by the Chart library, with the correct interval
  let priceChart

  // make sure priceChartOrders is loaded...
  if (priceChartOrders) {

    let secondLastOrder, lastOrder

    // get last 2 orders, to figure out whether last price was higher or lower
    [secondLastOrder, lastOrder] = priceChartOrders.slice(priceChartOrders.length - 2, priceChartOrders.length)

    // Lodash 'get' does auto-check if lastOrder exists ... otherwise return the 0
    const lastPrice = get(lastOrder, 'tokenPrice', 0)
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    priceChart = ({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(priceChartOrders)
      }]
    })
  }

  const intervalHandler = async (e) => {
    // set the internal react state value for the chart interval, to the value selected
    setIntervalSelection(e.target.value)
  }

  return (
    <div className="component exchange__chart">
      <div className='component__header flex-between'>
        <div className='flex'>

          <h2>{symbols && `${symbols[0]}/${symbols[1]}`}</h2>

          {/* display the arrow and last price, if the priceChart data exists */}
          {priceChart && (
            <div className='flex'>
              {priceChart.lastPriceChange === '+' ? (
                <img src={arrowUp} alt="Arrow up" />
              ) : (
                <img src={arrowDown} alt="Arrow down" />
              )}
              <span className='up'>{priceChart.lastPrice}</span>
            </div>
          )}

        </div>

        {/* display the candlestick-interval selector, if chart data exists */}
        {priceChart && (    
          <div className='flex-end'>
            <div className='flex'>

              <div className='component exchange__interval'>
                <select name="interval" id="interval" onChange={intervalHandler}>
                  // value = candle stick time interval in minutes
                  <option value={1}>1m</option>
                  <option value={5}>5m</option>
                  <option value={15}>15m</option>
                  <option value={60}>1h</option>
                  <option value={360}>6h</option>
                  <option value={1440}>1d</option>
                  <option value={10080}>1w</option>
                </select>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Price chart goes here */}

      {!account ? (
        <Banner text={'Please connect with Metamask'} />
      ) : (
        <Chart
          type="candlestick"
          options={options}
          series={ priceChart ? priceChart.series : defaultSeries }
          width="100%"
          height="100%"
        />
      )}

    </div>
  );
}

export default PriceChart;
