// interactions.js
//		code for the action logic

import { ethers } from 'ethers'
// Note: abis/Token.json was copied from within artifacts/contracts/Token.sol/Token.json
// Note2: if Token contract is modified, must re-create the abis/Token.json
import TOKEN_ABI from '../abis/Token.json';

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

export const loadAccount = async (dispatch) => {
	// Note: standard method to make an rpc call to our node to get accounts from MetaMask
	const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
	// Note: the below util ensures the address is in the correct format
	const account = ethers.utils.getAddress(accounts[0])

	dispatch({ type: 'ACCOUNT_LOADED', account })

	return account
}

// create an instance of the Token smart contract, so we can interact with it
export const loadToken = async (provider, address, dispatch) => {
	let token, symbol

	// See Note for TOKEN_ABI above
	token = new ethers.Contract(address, TOKEN_ABI, provider)
	symbol = await token.symbol()
	dispatch({ type: 'TOKEN_LOADED', token, symbol })

	return token
}
