// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./BEP20FlashLoan.sol";
import "./IBEP20.sol";
import "./Venus.sol";

contract BEP20FlashBorrower is Venus {
    BEP20FlashLoan public constant bep20FlashLoan = BEP20FlashLoan(address(0xA227A7d44Bc538ddcec4227d8284e73d6fded864));

    function flashBorrow(address token, uint256 amount) public {    
        bep20FlashLoan.flashLoan(token, amount);
    }

    function executeOnBEP20FlashLoan(address token, uint256 amount, uint256 debt) external {
        require(msg.sender == address(bep20FlashLoan), "only lender contract can execute");        

        // mint and get vToken
        deposit(token, amount);

        // Borrow enough _asset to buy back
        borrow(token, debt);

        // Pay back flashloan
        IBEP20(token).approve(address(bep20FlashLoan), debt);

        // convert vToken to token
        IBEP20 vToken = IBEP20(vTokenAddress);
        uint256 vTokenBalance = vToken.balanceOf(address(this));
        withdraw(token, vTokenBalance);
    }

   
}
