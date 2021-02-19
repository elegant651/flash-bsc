// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./IBEP20.sol";
import "./IVenus.sol";

contract Venus {
    address internal tokenAddress;
    address internal vTokenAddress;
    address internal vBnbAddress;

    constructor() public {
        // BUSD Address: 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47
        // vBUSD Address: 0x08e0A5575De71037aE36AbfAfb516595fE68e5e4
        tokenAddress = 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47;
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
