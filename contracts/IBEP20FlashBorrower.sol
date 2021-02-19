pragma solidity ^0.6.6;

interface IBEP20FlashBorrower {
    function executeOnBEP20FlashLoan(address token, uint256 amount, uint256 debt) external;
}