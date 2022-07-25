// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";			// imports our other contract for use here

contract Exchange {
	address public feeAccount;	// public to read outside the blockchain
	uint256 public feePercent;
	uint256 public orderCount;

	// set up mapping to track user balances
	// 'tokens' = nested mapping of token address to user address to #of tokens
	mapping(address => mapping(address => uint256)) public tokens;
	
	// Orders mapping ... ID to the Order struct
	mapping(uint256 => _Order) public orders;

	// Order struct
	struct _Order {
		uint256 id;			// unique ID for order
		address user;		// user who made the order
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp; 	// when order was created
		// orderStatus;  ??
	}

	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);

	event Order (
		uint256 id,			// unique ID for order
		address user,		// user who made the order
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint256 timestamp 	// when order was created
	);

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


	// ------------------------
	// MAKE & CANCEL ORDERS

	// tokenGive = token to spend (which token and how much?)
	// tokenGet = token to receive (which token and how much?)
	function makeOrder(
		address _tokenGet, 
		uint256 _amountGet, 
		address _tokenGive, 
		uint256 _amountGive
	) public {
		// prevent orders if tokens are not on exchange
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

		// Create order
		orderCount = orderCount + 1;
		orders[orderCount] = _Order(
			orderCount, 			// id
			msg.sender, 			// user
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp			// timestamp for the order
		);

		// emit event
		emit Order(
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
		);
	}

	// Cancel Orders

	// Fill Orders

	// Charge Fees (10%)

}
