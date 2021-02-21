import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Card, CardDeck, Image } from "react-bootstrap";
import { time } from "../web3/time";
import Loading from "./Loading";

export default function Main() {
  const dai = "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd"

  const [listCoupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noMetamsk, setNoMetamask] = useState(false);

  const createSubArray = (coupons) => {
    let chunks = [];

    while (coupons.length > 4) {
      chunks.push(coupons.splice(0, 4));
    }

    if (coupons.length > 0) {
      chunks.push(coupons);
    }

    setCoupons(chunks);
    setLoading(false);
  }

  const getCoupons = async () => {
    const allCoupons = [];
    const couponCount = await window.couponFactory
      .methods
      .totalCoupons()
      .call();

    if (Number(couponCount) === 0) {
      setLoading(false);
    }

    for (let i = couponCount - 1; i >= 0; i--) {
      const distCoupon = await window.couponFactory
        .methods
        .allCoupons(i)
        .call();

      allCoupons.push(distCoupon);

      if (i === 0) {
        createSubArray(allCoupons);
      }
    }
  }

  const isMetamaskInstalled = () => {
    return (typeof window.ethereum !== 'undefined');
  }

  useEffect(() => {
    if (!isMetamaskInstalled()) {
        setLoading(false);
        setNoMetamask(true);
    } else if (listCoupons.length === 0) {
        getCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function DisplayCard({ coupon, count }) {
    return (
      <Card key={count} className="display-coupon-card" >
        <Link
          key={count}
          style={{ textDecoration: "none", color: "black" }}
          to={`/view/${coupon.couponAddress}/${coupon.couponTokenSymbol}/DAI`}
        >
          <Card.Header style={{ marginBottom: "5px" }}>
            <Image src={coupon.baseTokenURI} width="50px"></Image>
            <span> {coupon.couponTokenName} Coupon</span>
          </Card.Header>

          <Card.Body>
            <div style={{ marginBottom: "10px" }}>
              Ticket Price: {coupon.ticketPrice}
              <span> {"DAI"}
              </span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              Dist Interval: Every {coupon.distInterval} minutes
            </div>
            <div style={{ marginBottom: "5px" }}>
              {time.currentUnixTime() < (
                Number(coupon.couponStartTimestamp) +
                Number(coupon.ticketBuyDuration) * 60
              ) ?
                <div>
                  <span>Close In: </span>
                  <span className="info-message">
                    {time.getRemaingTime(
                      Number(coupon.couponStartTimestamp) +
                      Number(coupon.ticketBuyDuration) * 60
                    )}
                  </span>
                </div>
                :
                <span className="warning-message">
                  Sold out
                </span>
              }
            </div>
          </Card.Body>
        </Link>
      </Card>
    );
  }

  if (loading) {
    return <Loading />
  };

  return (
    <div>
      {!noMetamsk ?
        (listCoupons.map((element, key) => (
          element.length === 4 ?
            <CardDeck key={key} style={{ margin: "2%" }}>
              {element.map((coupon, k) => (
                <DisplayCard key={k} coupon={coupon} count={k} />
              ))}
            </CardDeck>
            :
            <CardDeck key={key} style={{ margin: "2%" }}>
              {element.map((coupon, k) => (
                <DisplayCard key={k} coupon={coupon} count={k} />
              ))}

              {[...Array(4 - element.length)].map((x, i) =>
                <Card
                  key={element.length + i + 1}
                  className="hidden-card"
                ></Card>
              )}
            </CardDeck>
          )))
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

