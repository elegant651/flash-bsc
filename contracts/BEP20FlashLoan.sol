// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

import "./IBEP20FlashBorrower.sol";
import "./IBEP20.sol";

contract BEP20FlashLoan {

    uint256 internal _tokenBorrowFee = 0.001e18; // 0.1% Fee
    uint256 constant internal ONE = 1e18;

    function flashLoan(address token, uint256 amount) external {
        
        // record debt
        uint256 debt = 10;

        // send borrower the tokens
        require(IBEP20(token).transfer(msg.sender, amount * 10**IBEP20(token).decimals()), "borrow failed");

        // execute flash loan
        IBEP20FlashBorrower(msg.sender).executeOnBEP20FlashLoan(token, amount, debt);

        // repay the debt
        // require(IBEP20(token).transferFrom(msg.sender, address(this), debt), "repayment failed");
    }

    function tokenBorrowerFee() public view returns (uint256) {
        return _tokenBorrowFee;
    }
}