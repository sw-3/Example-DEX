// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";

contract Token {
	string public name;
	string public symbol;
	uint256 public decimals = 18;
	uint256 public totalSupply;

	// track balances with a key-value mapping; address = key, values are uint256
	mapping(address => uint256) public balanceOf;
	
	event Transfer(
		address indexed from, 
		address indexed to, 
		uint256 value
	);

	constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals);
		// msg.sender is the address of whoever called this function
		balanceOf[msg.sender] = totalSupply;
	}

	function transfer(address _to, uint256 _value) 
		public 
		returns (bool success) 
	{
		// require that sender has enough tokens to spend; will throw if not
		require(balanceOf[msg.sender] >= _value);
		require(_to != address(0));

		// deduct tokens from spender
		balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
		// credit tokens to receiver
		balanceOf[_to] = balanceOf[_to] + _value;
		// emit event
		emit Transfer(msg.sender, _to, _value);

		return true;
	}
}
