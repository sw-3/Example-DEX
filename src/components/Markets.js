import { useSelector, useDispatch } from 'react-redux'	// hooks
import config from '../config.json'
import { loadTokens } from '../store/interactions'

const Markets = () => {

	// pull the data from the current state with useSelector
	const provider = useSelector(state => state.provider.connection)
	const chainId = useSelector(state => state.provider.chainId)

	const dispatch = useDispatch()

	const marketHandler = async (e) => {
		// use loadTokens to reload the pair of tokens, using the value selected
		loadTokens(provider, (e.target.value).split(','), dispatch)
	}

	return(
		<div className='component exchange__markets'>
			<div className='component__header'>
				<h2>Select Market</h2>
			</div>

			{chainId && config[chainId] ? (
				<select name="markets" id="markets" onChange={marketHandler}>
					// value = the Token contract address for each token in the pair
					<option value={`${config[chainId].DApp.address},${config[chainId].mETH.address}`}>DApp / mETH</option>
					<option value={`${config[chainId].DApp.address},${config[chainId].mDAI.address}`}>DApp / mDAI</option>
				</select>

			) : (
				<div>
					<p>Not deployed to network</p>
				</div>
			)}

			<hr />
		</div>
	)
}

export default Markets;
