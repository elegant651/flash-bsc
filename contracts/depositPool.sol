// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
import "./BEP20FlashLoan.sol";
import "./IBEP20.sol";

contract depositPool is BEP20FlashLoan{
  constructor() public {}

  function deposit(
    address token, //0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee
    uint256 amount // 1
  ) public {

    require(
      IBEP20(token).transferFrom(msg.sender, address(this), amount * 10**IBEP20(token).decimals()),
      "BEP20: transferFrom failed !!"
    );
  }
	

  function withdraw(
    address token, //BUSD
    address onbehalfOf
  ) public {
    IBEP20(token).transfer(onbehalfOf, IBEP20(token).balanceOf(address(this)));
  }
}
