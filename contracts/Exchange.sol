// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";			// imports our other contract for use here

contract Exchange {
	address public feeAccount;	// public to read outside the blockchain
	uint256 public feePercent;
	// set up mapping to track user balances
	// 'tokens' = nested mapping of token address to user address to #of tokens
	mapping(address => mapping(address => uint256)) public tokens;

	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);

	// Track Fee Account
	constructor(address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	// ------------------------
	// DEPOSIT & WITHDRAW TOKEN

	function depositToken(address _token, uint256 _amount) public {
		// transfer tokens to exchange; 'require' protects from updating if txfer fails
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));

		// update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

		// emit an event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	// Withdraw Tokens
	function withdrawToken(address _token, uint256 _amount) public {
		// ensure user has enough tokens to withdraw
		require(tokens[_token][msg.sender] >= _amount);
		// transfer tokens to the user
		// use "transfer" function since the exchange holds the tokens and is the caller
		Token(_token).transfer(msg.sender, _amount);

		// update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

		// emit an event
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	// Check Balances
	function balanceOf(address _token, address _user)
		public
		view
		returns(uint256)
	{
		return tokens[_token][_user];
	}

	// Make Orders

	// Cancel Orders

	// Fill Orders

	// Charge Fees (10%)

}
