// import the chai expect library function
const { expect } = require('chai');
// pull in ethers library from hardhat
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
	let exchange, deployer, feeAccount

	const feePercent = 10

	beforeEach(async () => {
		// Fetch the accounts
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]

		// Fetch contract, deploy, and get Token from Blockchain
		const Exchange = await ethers.getContractFactory('Exchange')
		exchange = await Exchange.deploy(feeAccount.address, feePercent)
	})

	describe('Deployment', () => {

		it('tracks the fee account', async () => {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)
		})

		it('tracks the fee percent', async () => {
			expect(await exchange.feePercent()).to.equal(feePercent)
		})
	})
})
