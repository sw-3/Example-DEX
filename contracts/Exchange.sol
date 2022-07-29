// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";			// imports our Token contract for use here

contract Exchange {
	address public feeAccount;	// public; can read outside the blockchain
	uint256 public feePercent;	// account to receive fees & the fee % to charge
	uint256 public orderCount;	// these are auto-set to zero if not initialized

	// set up mapping to track user balances
	// 'tokens' = nested mapping of token address to user address to #of tokens
	mapping(address => mapping(address => uint256)) public tokens;
	
	// orders mapping ... order ID to the Order struct
	mapping(uint256 => _Order) public orders;

	// mapping of cancelled orders
	mapping(uint256 => bool) public orderCancelled;

	// mapping of filled orders
	mapping(uint256 => bool) public orderFilled;

	// Order struct
	struct _Order {
		uint256 id;			// unique ID for order
		address user;		// user who made the order
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp; 	// when order was created
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

	event Cancel (
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint256 timestamp
	);

	event Trade (
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		address creator,
		uint256 timestamp
	);


	// constructor to create an exchange, with fee account and fee %
	constructor(address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	// -------------------------
	// DEPOSIT & WITHDRAW TOKENS

	function depositToken(address _token, uint256 _amount) public {

		// transfer tokens to exchange; 
		// 	'require' protects from updating if txfer fails
		//	'msg.sender' is the account calling this function
		//	'address(this)' is the account of this smart contract (the exchange)
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));

		// update the balance on the exchange for this user
		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

		// emit an event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function withdrawToken(address _token, uint256 _amount) public {
		// ensure user has enough tokens to withdraw
		require(tokens[_token][msg.sender] >= _amount);
		// transfer tokens from the Exchange to the user (msg.sender)
		// use "transfer" function since the exchange holds the tokens
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
		orderCount++;
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
	function cancelOrder(uint256 _id) public {
		// fetch order
		// storage means get it from blockchain - not memory
		_Order storage _order = orders[_id];

		// Ensure the caller of the function is the owner of the order
		require(address(_order.user) == msg.sender);

		// Order must exist
		require(_order.id == _id);

		// cancel order
		orderCancelled[_id] = true;

		// emit event
		emit Cancel(
			_order.id,
			msg.sender,
			_order.tokenGet,
			_order.amountGet,
			_order.tokenGive,
			_order.amountGive,
			block.timestamp
		);
	}


	// ------------------------
	// EXECUTING ORDERS

	function fillOrder(uint256 _id) public {
		// must be valid order
		require(_id > 0 && _id <= orderCount, 'Order does not exist');

		// order cannot be filled
		require(!orderFilled[_id], 'Order has already been filled');

		// order cannot be cancelled
		require(!orderCancelled[_id], 'Order has been cancelled');

		// fetch order
		_Order storage _order = orders[_id];

		// swapping tokens
		_trade(
			_order.id, 
			_order.user,
			_order.tokenGet,
			_order.amountGet,
			_order.tokenGive,
			_order.amountGive
		);

		// mark order as filled
		orderFilled[_order.id] = true;
	}

	function _trade(
		uint256 _orderId,
		address _user,
		address _tokenGet,
		uint256 _amountGet,
		address _tokenGive,
		uint256 _amountGive
	) internal {

		// fee is paid by user who filled the order (msg.sender)
		// fee is calculated from amountGet
		uint256 _feeAmount = (_amountGet * feePercent) / 100;

		// execute the trade
		// msg.sender is filling the order; sending the _amountGet and fee
		tokens[_tokenGet][msg.sender] = 
			tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount);
		
		// _user is the one who created the order; receiving _amountGet
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

		// charge fees; the feeAccount receives the fee (in _tokenGet)
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

		// _user sends the _amountGive for the trade
		tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;

		// msg.sender receives the _amountGive for the trade
		tokens[_tokenGive][msg.sender] = 
			tokens[_tokenGive][msg.sender] + _amountGive;

		// emit trade event
		emit Trade(
			_orderId,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			_user,
			block.timestamp
		);
	}

}
