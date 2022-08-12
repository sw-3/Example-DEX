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
