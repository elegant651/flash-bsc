// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

interface IVenus {
    function mint(uint256 mintAmount) external returns (uint256);

    function redeemUnderlying(uint256 redeemTokens) external returns (uint256);

    function borrow(uint256 borrowAmount) external returns (uint256);

    function repayBorrow(uint256 borrowAmount) external returns (uint256);

    function exchangeRateStored() external view returns (uint256);

    function getCash() external view returns (uint256);

    function totalBorrows() external view returns (uint256);

    function totalReserves() external view returns (uint256);

    function totalSupply() external view returns (uint256);
}
