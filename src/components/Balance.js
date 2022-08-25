// useState allows saving the state of a react component (not necessarily global)
import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import dapp from '../assets/dapp.svg'
import eth from '../assets/eth.svg'

import { loadBalances, transferTokens } from '../store/interactions'

const Balance = () => {
  // Note: useState() allows access to the React component state, for
  //    this Balance component.  (Not the Redux global state)

  // these vars track the value of the 2 amounts in the fields on the page
  // set the var by using the 2nd as a function: setToken1TransferAmount(1.0)
  const [token1TransferAmount, setToken1TransferAmount] = useState(0)
  const [token2TransferAmount, setToken2TransferAmount] = useState(0)
  // track the state of the Deposit/Withdraw tab
  const [isDeposit, setIsDeposit] = useState(true)  // default is True for Deposit

  const dispatch = useDispatch()

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)

  const exchange = useSelector(state => state.exchange.contract)
  const exchangeBalances = useSelector(state => state.exchange.balances)

  // whenever transferInProgress changes, we want to reload the Balances component
  const transferInProgress = useSelector(state => state.exchange.transferInProgress)

  const tokens = useSelector(state => state.tokens.contracts)
  const symbols = useSelector(state => state.tokens.symbols)
  const tokenBalances = useSelector(state => state.tokens.balances)

  // create a reference to the tabs, so we can change highlight class on them
  // attach these to the button elements in the HTML with "ref="
  const depositRef = useRef(null)     // reference to the deposit tab
  const withdrawRef = useRef(null)    // reference to the withdraw tab

  // function to modify the CSS className to make the correct UI tab "active"
  const tabHandler = (e) => {
    if(e.target.className !== depositRef.current.className) {
      e.target.className = 'tab tab--active'
      depositRef.current.className = 'tab'
      setIsDeposit(false)
    } else {
      e.target.className = 'tab tab--active'
      withdrawRef.current.className = 'tab'
      setIsDeposit(true)
    }
  }

  const amountHandler = (e, token) => {
    if (token.address === tokens[0].address) {
      setToken1TransferAmount(e.target.value)
    }
    else if (token.address === tokens[1].address) {
      setToken2TransferAmount(e.target.value)
    }
  }

  const depositHandler = (e, token) => {
    // prevent the default behavior (page refresh), when Submit event received
    e.preventDefault()    
    
    // execute the transferToken Action
    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
      // clear the deposit amount field
      setToken1TransferAmount(0)
    }
    else if (token.address === tokens[1].address) {
      transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch)
      // clear the deposit amount field
      setToken2TransferAmount(0)
    }
  }

  const withdrawHandler = (e, token) => {
    // prevent the default behavior (page refresh), when Submit event received
    e.preventDefault()    
    
    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
      // clear the deposit amount field
      setToken1TransferAmount(0)
    }
    else if (token.address === tokens[1].address) {
      transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch)
      // clear the deposit amount field
      setToken2TransferAmount(0)
    }
  }

  // Note: useEffect() takes a function to execute, plus array of args for the function
  // Note2:   if any of the last array of args changes, the function will execute again
  //
  // this will load the user balances from the blockchain for the token pair
  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch)
    }
  }, [exchange, tokens, account, transferInProgress])


// NOTE: everything inside the return(..) below is what renders on the page.
// NOTE: {symbols && symbols[0]} is a short-hand 'if'. If symbols exists, display symbols[0]
// Note: '===' ensures that the vars type is the same also
// Note: the things displayed here must be first stored/retrieved from the Redux state.
  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
          <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />{symbols && symbols[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input 
            type="text" 
            id='token0' 
            placeholder='0.0000'
            value={token1TransferAmount === 0 ? '' : token1TransferAmount } 
            onChange={(e) => amountHandler(e, tokens[0])}/>

          <button className='button' type='submit'>
            {isDeposit ? (
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{symbols && symbols[1]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
          <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
          <input 
            type="text" 
            id='token1' 
            placeholder='0.0000'
            value={token2TransferAmount === 0 ? '' : token2TransferAmount } 
            onChange={(e) => amountHandler(e, tokens[1])}/>

          <button className='button' type='submit'>
            {isDeposit ? (
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;
