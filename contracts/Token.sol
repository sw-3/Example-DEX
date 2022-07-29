// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";

// This Token smart contract follows the ERC-20 standard
contract Token {
	string public name;
	string public symbol;
	uint256 public decimals = 18;
	uint256 public totalSupply;

	// track balances with a key-value mapping; key is an address, balance values are uint256
	mapping(address => uint256) public balanceOf;

	// mapping to track how many of this token a user has allowed on exchanges
	// owner's account address mapped to a mapping of exchange addresses to balance allowed
	// NOTE: should return the remaining balance that is still allowed
	mapping(address => mapping(address => uint256)) public allowance;

	// events to broadcast to the nodes on the blockchain	
	event Transfer(
		address indexed from, 
		address indexed to, 
		uint256 value
	);

	event Approval(
		address indexed owner,
		address indexed spender,
		uint256 value
	);

	// constructor to initialize a token
	constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals);
		// msg.sender is the address of whoever called this function
		balanceOf[msg.sender] = totalSupply;
	}

	// erc-20 transfer function, to txfer the token from caller's to another address
	function transfer(address _to, uint256 _value) 
		public 
		returns (bool success) 
	{
		// require that sender has enough tokens to spend; will throw/revert if not
		require(balanceOf[msg.sender] >= _value);

		_transfer(msg.sender, _to, _value);

		return true;
	}

	// generic internal-only function to transfer tokens
	// 		assumes sender has enough tokens before this is called
	function _transfer(address _from, address _to, uint256 _value) internal {
		require(_to != address(0));

		balanceOf[_from] = balanceOf[_from] - _value;
		balanceOf[_to] = balanceOf[_to] + _value;

		// emit the Transfer event to the blockchain
		emit Transfer(_from, _to, _value);

	}

	// erc-20 function to allow _spender to withdraw funds from your acct, up to _value

	// NOTE: check on this - "To prevent attack vectors, clients SHOULD make sure to 
	// create user interfaces in such a way that they set the allowance first to 0 
	// before setting it to another value for the same spender."
	function approve(address _spender, uint256 _value) 
		public 
		returns(bool success)
	{
		require(_spender != address(0));

		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	// erc-20 function to allow a contract to transfer tokens on your bahalf
	function transferFrom(address _from, address _to, uint256 _value) 
		public 
		returns(bool success)
	{
		// check approval
		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);

		// update the allowance amount
		allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

		// spend tokens
		_transfer(_from, _to, _value);
		
		return true;
	}
}
