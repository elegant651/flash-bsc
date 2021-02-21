import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Card, CardDeck, Image } from "react-bootstrap";
import { time } from "../web3/time";
import Loading from "./Loading";

export default function Main() {
  const [loading, setLoading] = useState(true);
  const [noMetamsk, setNoMetamask] = useState(false);  
  const [poolBalance, setPoolBalance] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const token = useState({
    name: "BUSD",
    address: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee",
    vTokenAddress: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    status: false
  })

  const getInfo = async () => {
    
    setLoading(false);
    // const allCoupons = [];
    // const couponCount = await window.couponFactory
    //   .methods
    //   .totalCoupons()
    //   .call();

    // if (Number(couponCount) === 0) {
    //   setLoading(false);
    // }

    // for (let i = couponCount - 1; i >= 0; i--) {
    //   const distCoupon = await window.couponFactory
    //     .methods
    //     .allCoupons(i)
    //     .call();

    //   allCoupons.push(distCoupon);

    //   if (i === 0) {
    //     createSubArray(allCoupons);
    //   }
    // }
  }

  const getBalance = async () => {
    const response = await window.flashModule
      .methods.getBalance(
        token.vTokenAddress
      ).call();
    console.log('r', response)
    this.setBalance(response)
  }

  const getTotalSupply = async () => {
    const response = await window.flashModule
      .methods.getTotalSupply(
        token.vTokenAddress
      ).call();
    console.log('r', response)
    this.setTotalSupply(response)
  }

  const getPoolBalance = async () => {
    const response = await window.flashModule
      .methods.getPoolBalance(
        token.vTokenAddress
      ).call();
    console.log('r', response)
    this.setPoolBalance(response)
  }

  const isMetamaskInstalled = () => {
    return (typeof window.ethereum !== 'undefined');
  }

  useEffect(() => {
    if (!isMetamaskInstalled()) {
        setLoading(false);
        setNoMetamask(true);
    }
    getInfo();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function DisplayCard({ info }) {
    return (
      <Card className="display-coupon-card" >
        
          <Card.Header style={{ marginBottom: "5px" }}>
            Pool Info
          </Card.Header>

          <Card.Body>
            <div style={{ marginBottom: "10px" }}>
              Deposit Pool: 6 BUSD
            </div>
            <div style={{ marginBottom: "10px" }}>
              Balance: 18 BUSD
            </div>
            <div style={{ marginBottom: "5px" }}>
              {/* Pool Balance: {poolBalance} <br />
              Pool TotalSupply: {totalSupply} */}
            </div>
          </Card.Body>
      </Card>
    );
  }

  if (loading) {
    return <Loading />
  };

  return (
    <div>
      {!noMetamsk ?
        <CardDeck style={{ margin: "2%" }}>
            <DisplayCard />
        </CardDeck>
        : <div
            className="alert-message"
            style={{ marginTop: "20%", fontSize: "x-large" }}
          >
            You don't have metamask. Please install first !!
        </div>
      }
    </div >
  );

}

