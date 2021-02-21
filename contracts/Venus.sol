// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./IBEP20.sol";
import "./IVenus.sol";

contract Venus {
    address internal tokenAddress;
    address internal vTokenAddress;
    address internal vBnbAddress;

    constructor() public {
        // BUSD Address: 0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee
        // vBUSD Address: 0x08e0A5575De71037aE36AbfAfb516595fE68e5e4
        tokenAddress = 0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee;
        vTokenAddress = 0x08e0A5575De71037aE36AbfAfb516595fE68e5e4;
        vBnbAddress = 0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c;
    }

    receive() external payable {}

    function deposit(address vAsset, uint256 amount) internal returns (bool) {
        // Approve vBUSD contract to move your BUSD
        require(
            IBEP20(tokenAddress).approve(vAsset, amount),
            "Venus: Approve Failed !!"
        );

        // Deposit Token to lending pool
        uint256 result = IVenus(vAsset).mint(amount);

        return result == 0 ? true : false;
    }

    function withdraw(address vAsset, uint256 amount) internal returns (bool) {
        // Withdraw Token for pool
        uint256 result = IVenus(vAsset).redeemUnderlying(amount);

        return result == 0 ? true : false;
    }

    function borrow(address vAsset, uint256 amount) internal returns (bool) {
        uint256 result = IVenus(vAsset).borrow(amount);

        return result == 0 ? true : false;
    }

    function repayBorrow(address vAsset, uint256 amount) internal returns (bool) {
        uint256 result = IVenus(vAsset).repayBorrow(amount);

        return result == 0 ? true : false;
    }

    function getBalance(address vAsset) public view returns (uint256) {
        uint256 balance = IBEP20(vAsset).balanceOf(address(this));
        return balance;
    }

    function getCash(address vAsset) public view returns (uint256) {
        uint256 cash = IVenus(vAsset).getCash();
        return cash;
    }

    function getTotalBorrows(address vAsset) public view returns (uint256) {
        uint256 totalBorrows = IVenus(vAsset).totalBorrows();
        return totalBorrows;
    }

    function getTotalReserves(address vAsset) public view returns (uint256) {
        uint256 totalReserves = IVenus(vAsset).totalReserves();
        return totalReserves;
    }

    function getTotalSupply(address vAsset) public view returns (uint256) {
        uint256 totalSupply = IVenus(vAsset).totalSupply();
        return totalSupply;
    }

    function getPoolBalance(address vAsset) public view returns (uint256) {
        uint256 balance = IBEP20(vAsset).balanceOf(address(this));
        uint256 cash = IVenus(vAsset).getCash();
        uint256 totalBorrows = IVenus(vAsset).totalBorrows();
        uint256 totalReserves = IVenus(vAsset).totalReserves();
        uint256 totalSupply = IVenus(vAsset).totalSupply();

        uint256 exchangeRate = (cash + totalBorrows - totalReserves) /
            totalSupply;

        return exchangeRate * balance;
    }
}
