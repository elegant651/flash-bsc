// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

import "./IBEP20FlashBorrower.sol";
import "./NSafeMath.sol";
import "./IBEP20.sol";

contract BEP20FlashLoan {
    using NSafeMath for uint256;

    uint256 internal _tokenBorrowFee = 0.001e18; // 0.1% Fee
    uint256 constant internal ONE = 1e18;

    function BEP20FlashLoan(address token, uint256 amount) external {
        
        // record debt
        uint256 debt = amount.mul(ONE.add(_tokenBorrowFee)).div(ONE);

        // send borrower the tokens
        require(IBEP20(token).transfer(msg.sender, amount), "borrow failed");

        // execute flash loan
        IBEP20FlashBorrower(msg.sender).executeOnBEP20FlashLoan(token, amount, debt);

        // repay the debt
        require(IBEP20(token).transferFrom(msg.sender, address(this), debt), "repayment failed");
    }

    function tokenBorrowerFee() public view returns (uint256) {
        return _tokenBorrowFee;
    }
}