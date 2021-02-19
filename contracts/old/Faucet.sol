pragma solidity ^0.6.6;

import "./IERC20.sol";

contract Faucet {
  mapping(address => mapping(address => bool)) public alreadyClaimed;

  function claimTestTokens(address token) public {
    require(
      !alreadyClaimed[msg.sender][token],
      "You have already claimed tokens !!"
    );

    alreadyClaimed[msg.sender][token] = true;

    uint256 decimals = IERC20(token).decimals();
    IERC20(token).transfer(msg.sender, 100 * 10**decimals);
  }

  function getContractBalance(address token) public view returns (uint256) {
    uint256 decimals = IERC20(token).decimals();
    
    return IERC20(token).balanceOf(address(this)) / 10**decimals;
  }
}
