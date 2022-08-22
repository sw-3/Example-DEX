import { useEffect } from 'react';    // see note on useEffect() below
import { useDispatch } from 'react-redux'
// Note: if smart contract is modified/redeployed, must update config.json
import config from '../config.json'

// import our actions from interactions.js
import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange
} from '../store/interactions';

import Navbar from './Navbar'

function App() {
  // use the dispatch function imported from Redux, to dispatch actions
  const dispatch = useDispatch()    

  // loadBlockchainData
  //    load the blockchain data into our react app
  //---------------------------------------------------------------------------
  const loadBlockchainData = async () => {

    // connect ethers js library to the blockchain 
    // Note: the 'provider' exposes the connection to the blockchain node
    // Note: need to pass in the dispatch function so action can be dispatched
    const provider = loadProvider(dispatch)

    // Fetch the network chainId via the provider (hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // fetch the current account info from Metamask when changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    // fetch the Token smart contracts from the blockchain
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)

    // load Exchange smart contract
    const exchangeConfig = config[chainId].exchange
    await loadExchange(provider, exchangeConfig.address, dispatch)
  }

  //---------------------------------------------------------------------------
  // Note: useEffect allows you to perform side effects in function components
  //        ie. data fetching, manually change the DOM in React, etc
  //        It is a function that takes a (in-line below) function as the argument
  //        This is how we call loadBlockchainData(), etc, before we display the page
  useEffect(() => {
    loadBlockchainData()

    // do more stuff...

  })

  // return(...)
  //    code inside return() function gets shown on the page
  //---------------------------------------------------------------------------
  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
