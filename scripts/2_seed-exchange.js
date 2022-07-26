// seed-exchange.js
// script to seed initial data into our exchange

// the below line is only needed if you run with "node run scripts/myscript.js"
// we will run with "npx hardhat run ..."
// const hre = require('hardhat');

// import our smart contract address configuration
const config = require('../src/config.json')

// helper to convert amounts to tokens
const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

// wait function
const wait = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// main script to seed the exchange
async function main() {

	// fetch accounts from wallet - these are unlocked
 	const accounts = await ethers.getSigners()

 	// fetch network
 	const { chainId } = await ethers.provider.getNetwork()
 	console.log("Using chainId:", chainId)

 	// fetch deployed tokens
 	const DApp = await ethers.getContractAt('Token', config[chainId].DApp.address)
 	console.log(`DAPP token fetched: ${DApp.address}\n`)

 	const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
 	console.log(`mETH token fetched: ${mETH.address}\n`)

 	const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
 	console.log(`mDAI token fetched: ${mDAI.address}\n`)

 	// fetch the deployed exchange
 	const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
 	console.log(`Exchange fetched: ${exchange.address}\n`)

 	// set up accounts
 	const sender = accounts[0]
 	const receiver = accounts[1]
 	let amount = tokens(10000)

 	// user1 transfers 10,000 mETH...
 	let trasaction, result
 	transaction = await mETH.connect(sender).transfer(receiver.address, amount)
 	console.log(`Transferred ${amount} mETH tokens from ${sender.address} to ${receiver.address}\n`)

 	// set up exchange users
 	const user1 = accounts[0]
 	const user2 = accounts[1]
 	amount = tokens(10000)

	// user1 approves 10,000 DApp...
	transaction = await DApp.connect(user1).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user1.address}`)

	// user1 deposits 10,000 DApp
	transaction = await exchange.connect(user1).depositToken(DApp.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} DAPP from ${user1.address}\n`)

	// user2 approves 10,000 mETH...
	transaction = await mETH.connect(user2).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user2.address}`)

	// user2 deposits 10,000 mETH
	transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} mETH from ${user2.address}\n`)

	///////////////////////////////////////////////////////////////
	// Seed a Cancelled Order
	//

	// user1 makes order to get tokens
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	//user1 cancels order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user1).cancelOrder(orderId)
	result = await transaction.wait()
	console.log(`Cancelled order from ${user1.address}\n`)

	// wait 1 second
	await wait(1)

	/////////////////////////////////////////////////////////////
	// Seed some filled orders (3)
	//

	// user1 makes order
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	// user2 fills the order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user2.address}\n`)

	// wait 1 second
	await wait(1)

	// user1 makes another order
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	// user2 fills another order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user2.address}\n`)

	await wait(1)

	// user1 makes final order
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	// user2 fills final order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user2.address}\n`)

	await wait(1)	

	/////////////////////////////////////////////////////////////
	// Seed some open orders
	//

	// user1 makes orders
	for (let i = 1; i <= 10; i++) {
		transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10*i), DApp.address, tokens(10))
		result = await transaction.wait()

		console.log(`Made order from ${user1.address}`)

		await wait(1)
	}
	console.log(`\nFinished making orders from ${user1.address}\n`)

	// user2 makes orders
	for (let i = 1; i <= 10; i++) {
		transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10*i))
		result = await transaction.wait()

		console.log(`Made order from ${user2.address}`)

		await wait(1)
	}

}

// boiler plate main function
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
