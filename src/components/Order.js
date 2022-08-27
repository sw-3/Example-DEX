import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { makeBuyOrder } from '../store/interactions'
import { makeSellOrder } from '../store/interactions'

const Order = () => {
	// these vars track the value of the Amount and Price fields on the page
	// set the var by using the 2nd as a function: setAmount(1.0)
	const [amount, setAmount] = useState(0)
	const [price, setPrice] = useState(0)
  	// track the state of the Buy/Sell tab
  	const [isBuy, setIsBuy] = useState(true)  // default is True for Buy tab being active

  	const provider = useSelector(state => state.provider.connection)
  	const tokens = useSelector(state => state.tokens.contracts)
  	const exchange = useSelector(state => state.exchange.contract)

  	const dispatch = useDispatch()

  	// create a reference to the tabs, so we can change highlight class on them
  	// attach these to the button elements in the HTML with "ref="
  	const buyRef = useRef(null)     // reference to the Buy tab
  	const sellRef = useRef(null)    // reference to the Sell tab

  	// function to modify the CSS className to make the correct UI tab "active"
  	const tabHandler = (e) => {
    	if(e.target.className !== buyRef.current.className) {
      		e.target.className = 'tab tab--active'
      		buyRef.current.className = 'tab'
      		setIsBuy(false)
    	} else {
      		e.target.className = 'tab tab--active'
      		sellRef.current.className = 'tab'
      		setIsBuy(true)
    	}
  	}

  	// Note: the "order" is represented by the { amount, price } object
  	//		amount and price come from the react state ... the UI field values
  	const buyHandler = (e) => {
  		e.preventDefault()
  		makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
	  	setAmount(0)
	  	setPrice(0)
  	}

  	const sellHandler = (e) => {
  		e.preventDefault()
  		makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch)
  		setAmount(0)
  		setPrice(0)
  	}

	return (
		<div className='component exchange__orders'>
			<div className='component__header flex-between'>
				<h2>New Order</h2>
				<div className='tabs'>
          			<button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
          			<button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
				</div>
			</div>

			<form onSubmit={ isBuy ? buyHandler : sellHandler }>

				{isBuy ? (
					<label htmlFor="amount">Buy Amount</label>
				) : (
					<label htmlFor="amount">Sell Amount</label>
				)}

				<input 
					type='text' 
					id='amount' 
					placeholder='0.0000' 
					value={amount === 0 ? '' : amount}
					onChange={(e) => setAmount(e.target.value)}
				/>

				{isBuy ? (
					<label htmlFor="price">Buy Price</label>
				) : (
					<label htmlFor="price">Sell Price</label>
				)}

				<input 
					type='text' 
					id='price' 
					placeholder='0.0000' 
					value={price === 0 ? '' : price}
					onChange={(e) => setPrice(e.target.value)}/>

				<button className='button button--filled' type='submit'>
					{ isBuy ? (
						<span>Buy Order</span>
					) : (
						<span> Sell Order</span>
					)}
				</button>
			</form>
		</div>
	);
}

export default Order;
