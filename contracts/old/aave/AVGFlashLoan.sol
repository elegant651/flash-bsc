//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;

import {
    IERC20,
    ILendingPool,
    IProtocolDataProvider,
    ILendingPoolAddressesProvider,
    IFlashLoanReceiver
} from "./Interfaces.sol";
import {SafeERC20, SafeMath} from "./Libraries.sol";

interface IAVGFlashLoan {
    function deposit(address _asset, uint256 _amountBorrowed) external;

    function withdraw(address _asset) external;

    function borrow(address _asset, uint256 _amountBorrowed) external;

    function repay(address _asset, uint256 _amountBorrowed) external;

    function transferAsset(
        address _asset,
        uint256 _amountBorrowed,
        address _to
    ) external;
}

contract AVGFlashLoan is IAVGFlashLoan, IFlashLoanReceiver {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public owner;

    ILendingPool constant lendingPool =
        ILendingPool(address(0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe));
    IProtocolDataProvider constant dataProvider =
      IProtocolDataProvider(
        address(0x3c73A5E5785cAC854D468F727c606C07488a29D6)
      );
    

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner || msg.sender == address(this),
            "Not owner"
        );
        _;
    }

    function deposit(address _asset, uint256 _amountBorrowed)
        public
        override
        onlyOwner
    {
        IERC20(_asset).safeApprove(address(lendingPool), _amountBorrowed);
        lendingPool.deposit(_asset, _amountBorrowed, address(this), 0);
    }

    function withdraw(address _asset) public override onlyOwner {
        lendingPool.withdraw(_asset, uint256(-1), msg.sender);
    }

    function borrow(address _asset, uint256 _amountBorrowed)
        public
        override
        onlyOwner
    {
        lendingPool.borrow(_asset, _amountBorrowed, 1, 0, address(this));
    }

    function repay(address _asset, uint256 _amountBorrowed)
        public
        override
        onlyOwner
    {
        IERC20(_asset).safeApprove(address(lendingPool), _amountBorrowed);
        lendingPool.repay(_asset, _amountBorrowed, 1, address(this));
    }

    function transferAsset(
        address _asset,
        uint256 _amountBorrowed,
        address _to
    ) public override onlyOwner {
        IERC20(_asset).safeTransfer(_to, _amountBorrowed);
    }


    function takeFlashloan(
        address _asset,
        uint256 _amountBorrowed,
        bytes calldata _params
    ) public onlyOwner {
        address[] memory assets = new address[](1);
        assets[0] = _asset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = _amountBorrowed;

        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        // Borrow `_amountBorrowed` of `_asset`
        lendingPool.flashLoan(
            address(this), // receiverAddress
            assets,
            amounts,
            modes,
            address(this), // onBehalfOf
            _params, //params
            0 // referralcode
        );
    }


    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {        
        require(initiator == address(this), "it is not initiator");

        uint256 owns = amounts[0].add(premiums[0]);
        _swapEth(assets[0], amounts[0], owns, params);

        // Pay back flashloan
        IERC20(assets[0]).safeApprove(address(lendingPool), owns);

        return true;
    }

    function _swapEth(
        address _asset,
        uint256 _amountBorrowed,
        uint256 _amountPayback,
        bytes calldata _params
    ) internal {
        IERC20 weth = IERC20(0xf3a6679b266899042276804930b3bfbaf807f15b);

        (   address _swapaddress,
            bytes memory _calldata
        ) = abi.decode(_params, (address, bytes));

        // Swap _asset to WETH
        IERC20(_asset).safeApprove(_swapaddress, _amountBorrowed);
        (bool success, ) = _swapaddress.call(_calldata);
        require(success, "Swap call failed");

        uint256 wethBalance = weth.balanceOf(address(this));
        // Deposit all weth into Aave
        this.deposit(address(weth), wethBalance);

        // Borrow enough _asset to buy back
        this.borrow(_asset, _amountPayback);
    }

    function LENDING_POOL() public view override returns (ILendingPool) {
        return lendingPool;
    }

    function ADDRESSES_PROVIDER()
        public
        view
        override
        returns (ILendingPoolAddressesProvider)
    {
        return dataProvider.ADDRESSES_PROVIDER();
    }

}