// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
import "./BEP20FlashLoan.sol";
import "./IBEP20.sol";

// ERC20 Flashloan Example
contract depositPool is BEP20FlashLoan{
    // set the Lender contract address to a trusted flashmodule contract
	uint256 public totalfees; // total fees collected till now
  mapping(address => uint256) public balances;

  constructor() public {}
    
  function deposit(
    address token,
    address onbehalfOf,
    uint256 amount
  ) public {
    IBEP20(token).transferFrom(onbehalfOf, address(this), amount);
  }
	

  function withdraw(
    address token,
    address onbehalfOf
  ) public {
    IBEP20(token).transfer(onbehalfOf, IBEP20(token).balanceOf(address(this)));
  }
}
