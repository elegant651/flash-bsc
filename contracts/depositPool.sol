// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
import "./BEP20FlashLoan.sol";
import "./IBEP20.sol";

contract depositPool is BEP20FlashLoan{
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
