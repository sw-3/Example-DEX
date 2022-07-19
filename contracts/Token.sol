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
	// send tokens


	constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals);
		// msg.sender is the address of whoever called this function
		balanceOf[msg.sender] = totalSupply;
	}
}
