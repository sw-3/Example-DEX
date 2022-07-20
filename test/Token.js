// import the chai expect library function
const { expect } = require('chai');
// pull in ethers library from hardhat
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {
	let token, accounts, deployer, receiver

	beforeEach(async () => {
		// Fetch contract, deploy, and get Token from Blockchain
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Dapp University', 'DAPP', '1000000')

		// Fetch the accounts
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
	})

	describe('Deployment', () => {
		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimals = '18'
		const totalSupply = tokens('1000000')

		it('has correct name', async () => {
			expect(await token.name()).to.equal(name)
		})

		it('has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol)
		})

		it('has correct decimals', async () => {
			expect(await token.decimals()).to.equal(decimals)
		})

		it('has correct total supply', async () => {
			expect(await token.totalSupply()).to.equal(totalSupply)
		})

		it('assigns total supply to deployer', async () => {
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
		})
	})

	describe('Sending Tokens', () => {
		let amount, transaction, result

		describe('Success', () => {

			beforeEach(async () => {
				amount = tokens(100)
				// token.connect(deployer) - connects deployer wallet to contract, for the tx
				transaction = await token.connect(deployer).transfer(receiver.address, amount)
				result = await transaction.wait()

			})
			it('transfers token balances', async () => {
				expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
				expect(await token.balanceOf(receiver.address)).to.equal(amount)
			
				// log balance after transfer
				//console.log("deployer balnace after transfer", await token.balanceOf(deployer.address))
				//console.log("receiver balnace after transfer", await token.balanceOf(receiver.address))
			})

			it('emits a Transfer event', async () => {
				//console.log(result)   // to see entire logged tx from above
				const event = result.events[0]
				//console.log(event)    // to see the first event emitted
				expect(event.event).to.equal('Transfer')
				const args = event.args
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(args.value).to.equal(amount)
			})
		})

		describe('Failure', () => {
			it('rejects insufficient balances', async () => {
				// try to transfer 100M tokens from deployer
				const invalidAmount = tokens(100000000)
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
			})

			it('rejects invalid recipient', async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
			})
		})

	})
	
})
