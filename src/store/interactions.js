// interactions.js
//		code for the action logic

import { ethers } from 'ethers'
// Note: abis/Token.json was copied from within artifacts/contracts/Token.sol/Token.json
// Note2: if Token contract is modified, must re-create the abis/Token.json
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'

// loadProvider connects us to the blockchain, dispatches the action, returns connection
export const loadProvider = (dispatch) => {
	// Note: window.ethereum is our connection exposed via MetaMask; create a Web3Provider from it
	const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({ type: 'PROVIDER_LOADED', connection })	// key:value have same name 'connection'

    return connection
}

// get the Network information from the blockchain connection/provider
export const loadNetwork = async (provider, dispatch) => {
	const { chainId } = await provider.getNetwork()
	dispatch({ type: 'NETWORK_LOADED', chainId })

	return chainId
}

export const loadAccount = async (provider, dispatch) => {
	// Note: standard method to make an rpc call to our node to get accounts from MetaMask
	const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
	// Note: the below util ensures the address is in the correct format
	const account = ethers.utils.getAddress(accounts[0])

	dispatch({ type: 'ACCOUNT_LOADED', account })

	// get the account ETH balance
	let balance = await provider.getBalance(account)
	balance = ethers.utils.formatEther(balance)

	dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

	return account
}

// create an instance of the Token smart contracts, so we can interact with them
export const loadTokens = async (provider, addresses, dispatch) => {
	let token, symbol

	// See Note for TOKEN_ABI above
	token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
	symbol = await token.symbol()
	dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
	symbol = await token.symbol()
	dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

	return token
}

// create an instance of the Exchange smart contract
export const loadExchange = async (provider, address, dispatch) => {
	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
	dispatch({ type: 'EXCHANGE_LOADED', exchange })

	return exchange
}

// subscribeToEvents
// subscribe/respond to blockchain events
// --------------------------------------------------------------------------------
export const subscribeToEvents = (exchange, dispatch) => {
	// 'Deposit' event, emitted from the exchange contract's depositToken function
	exchange.on('Deposit', (token, user, amount, balance, event) => {
		// dispatch that a transfer was successful
		dispatch({ type: 'TRANSFER_SUCCESS', event })
	})
	// 'Withdraw' event, emitted from the exchange contract's withdrawToken function
	exchange.on('Withdraw', (token, user, amount, balance, event) => {
		// dispatch that a transfer was successful
		dispatch({ type: 'TRANSFER_SUCCESS', event })
	})
}

// --------------------------------------------------------------------------
// LOAD USER BALANCES (WALLET & EXCHANGE)

export const loadBalances = async (exchange, tokens, account, dispatch) => {
	let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
	dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
	dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })

	balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
	dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
	dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })
}

// --------------------------------------------------------------------------
// TRANSFER TOKENS (DEPOSIT & WITHDRAWS)

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
	let transaction

	// Notify app that transfer request has been made
	// The reducer will create a 'pending' state, while the user interacts with Metamask
	dispatch({ type: 'TRANSFER_REQUEST' })

	try {
		// get signer from Metamask
		const signer = await provider.getSigner()
		const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

		if (transferType === 'Deposit') {		
			// approve the token first
			transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
			await transaction.wait()
			// ... now transfer the amount
			transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
		} else {
			// transfer the withdrawal amount
			transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
		}

		await transaction.wait()

	} catch(error) {
		// Notify the app if the transfer failed
		dispatch({ type: 'TRANSFER_FAIL' })
	}	
}
