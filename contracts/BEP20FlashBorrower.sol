// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./BEP20FlashLoan.sol";
import "./NSafeMath.sol";
import "./IBEP20.sol";

contract BEP20FlashBorrower is Venus {
    using NSafeMath for uint256;

    BEP20FlashLoan public constant bep20FlashLoan = BEP20FlashLoan(address(0xCCcd586C777BA2817F75e04c4e7305cc77C710F9));
    uint256 constant internal ONE = 1e18;

    function borrow(address token, uint256 amount) public onlyOwner {    
        bep20FlashLoan.BEP20FlashLoan(token, amount);
    }

    function executeOnBEP20FlashLoan(address token, uint256 amount, uint256 debt) external {
        require(msg.sender == address(bep20FlashLoan), "only lender contract can execute");        

        // mint and get vToken
        this.deposit(token, amount);

        // Borrow enough _asset to buy back
        this.borrow(token, dept);

        // Pay back flashloan
        IBEP20(token).approve(address(bep20FlashLoan), debt);

        // convert vToken to token
        IBEP20 vToken = IBEP20(vTokenAddress);
        uint256 vTokenBalance = vToken.balanceOf(address(this));
        this.withdraw(token, vTokenBalance);
    }

   
}
