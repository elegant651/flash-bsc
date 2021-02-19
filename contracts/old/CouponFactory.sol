// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;
import "./Coupon.sol";

contract CouponFactory {
    struct CouponInfo {
        address couponAddress;
        string couponTokenName;
        string couponTokenSymbol;
        address ticketBuyToken;
        uint256 ticketPrice;
        uint256 distInterval;
        uint256 couponStartTimestamp;
        uint256 ticketBuyDuration;
        string baseTokenURI;
    }

    uint256 public totalCoupons;
    CouponInfo[] public allCoupons;

    event NewCoupon(
        uint256 id,
        address distCouponAddress,
        string couponTokenName,
        string couponTokenSymbol,
        address ticketBuyToken,
        uint256 ticketPrice,
        uint256 distInterval,
        uint256 couponStartTimestamp,
        uint256 ticketBuyDuration,
        string baseTokenURI
    );

    function addCoupon(
        string memory _name,
        string memory _symbol,
        address _ticketBuyToken,
        uint256 _ticketBuyPrice,
        uint256 _distInterval,
        uint256 _ticketBuyDuration,
        string memory _baseTokenURI
    ) public {
        Coupon newCoupon = new Coupon(
            _name,
            _symbol,
            _ticketBuyToken,
            _ticketBuyPrice,
            _distInterval,
            _ticketBuyDuration,
            _baseTokenURI
        );

        address couponAddress = address(newCoupon);
        
        totalCoupons++;

        allCoupons.push(
            CouponInfo(
                couponAddress,
                _name,
                _symbol,
                _ticketBuyToken,
                _ticketBuyPrice,
                _distInterval,
                block.timestamp,
                _ticketBuyDuration,
                _baseTokenURI
            )
        );

        emit NewCoupon(
            totalCoupons,
            couponAddress,
            _name,
            _symbol,
            _ticketBuyToken,
            _ticketBuyPrice,
            _distInterval,
            block.timestamp,
            _ticketBuyDuration,
            _baseTokenURI
        );
    }
}
