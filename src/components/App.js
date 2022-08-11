import { useEffect } from 'react';    // see note on useEffect() below
import { useDispatch } from 'react-redux'
// Note: if smart contract is modified/redeployed, must update config.json
import config from '../config.json';

// import our actions from interactions.js
import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken
} from '../store/interactions';

function App() {
  // use the dispatch function imported from Redux, to dispatch actions
  const dispatch = useDispatch()    

  // loadBlockchainData
  //    load the blockchain data into our react app
  //---------------------------------------------------------------------------
  const loadBlockchainData = async () => {

    // fetch the current account (loadAccount talks to Metamask to get accounts)
    // need to pass the dispatch function so the action can be dispatched
    await loadAccount(dispatch)

    // connect ethers js library to the blockchain 
    // Note: the 'provider' exposes the connection to the blockchain node
    const provider = loadProvider(dispatch)

    // Fetch the network information via the provider connection
    const chainId = await loadNetwork(provider, dispatch)

    // fetch the DApp Token's smart contract from the blockchain
    await loadToken(provider, config[chainId].DApp.address, dispatch)
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

      {/* Navbar */}

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
