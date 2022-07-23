// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Exchange {
	address public feeAccount;	// public to read outside the blockchain
	uint256 public feePercent;

	// Deposit Tokens

	// Withdraw Tokens

	// Check Balances

	// Make Orders

	// Cancel Orders

	// Fill Orders

	// Charge Fees (10%)

	// Track Fee Account
	constructor(address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}
}
