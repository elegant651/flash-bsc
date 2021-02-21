import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import history from "./history";
import Loading from "./Loading";
import AlertModal from "./AlertModal";
import SuccessModal from "./SuccessModal";
import { precision } from "../web3/precision";
import { time } from "../web3/time";
import * as erc20Abi from "../abis/erc20Abi.json"
import * as distCouponAbi from "../abis/distCoupon.json";
import {
  Card,
  Row,
  Col,
  Button,
  CardDeck
} from "react-bootstrap";
import BuyTicket from "./view_coupon/BuyTicket";
import DisplayTickets from "./view_coupon/DisplayTickets";
import Claim from "./view_coupon/Claim";

export default function ViewCoupon() {
  let routes;
  const DAI = "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd";
  const { couponAddress, nftToken, buyToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  let [erc20Instance, setErc20Instance] = useState();
  let [contractInstance, setContractInstance] = useState();
  const [state, setState] = useState({
    totalTicket: 0,
    ticketPrice: 0,
    distInterval: 0,
    distCount: 0,
    couponStartTimestamp: 0,
    ticketBuyEndTime: 0,
    nextDistStartTime: 0,
    nftBalance: 0,
    tickets: [],
    couponResult: 0,
    tokenBaseURI: "",
    isWinnerTicket: false,
    couponWinnerAddr: "",
    erc20Balance: 0,
  });
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });
  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });
  const [showBuyTicket, setShowBuyTicket] = useState(false);
  const [showMetamaskError, setShowMetamaskError] = useState(false);

  const fetchContractData = async () => {
    try {
      if (!loading) setLoading(true);

      let result;
      if (!contractInstance) {
        result = await createContractInstance();
      }

      contractInstance = contractInstance ? contractInstance : result.contract;
      erc20Instance = erc20Instance ? erc20Instance : result.erc20;

      if (contractInstance) {
        setShowBuyTicket(false);

        const totalTicket = await contractInstance
          .methods.ticketNumber().call();

        const ticketPrice = await contractInstance
          .methods.ticketPrice().call();

        const distInterval = await contractInstance
          .methods.distInterval().call();

        const distCount = await contractInstance
          .methods.distCount().call();

        const couponStartTimestamp = await contractInstance
          .methods.couponStartTime().call();

        const ticketBuyEndTime = await contractInstance
          .methods.ticketBuyEndTime().call();

        const nextDistStartTime = await contractInstance
          .methods.getNextDistTimestamp().call();

        const nftBalance = await contractInstance
          .methods.balanceOf(window.userAddress).call();

        const tokenBaseURI = await contractInstance
          .methods.baseURI().call();


        let couponResult = 0, couponWinnerAddr = "";
        if (Number(distCount) === Number(totalTicket) - 1 &&
          time.currentUnixTime() > Number(ticketBuyEndTime)
        ) {
          couponResult = await contractInstance
            .methods.getFinalResult().call();

          couponWinnerAddr = await contractInstance
            .methods.getCouponWinner().call();
        }

        let tickets = [], isWinnerTicket = false;
        for (let i = 0; i < nftBalance; i++) {
          const ticketNumber = await contractInstance
            .methods.tokenOfOwnerByIndex(
              window.userAddress, i
            ).call();

          const isValid = await contractInstance
            .methods.stillValidTicket(
              ticketNumber
            ).call();

          tickets.push({ ticketNumber, isValid });

          if (Number(couponResult) === Number(ticketNumber)) {
            isWinnerTicket = true;
          }
        }

        let erc20Balance = await precision.remove(
          await erc20Instance
            .methods.balanceOf(window.userAddress).call(),
          await erc20Instance
            .methods.decimals().call()
        );

        console.log('fd', window.userAddress +"/" +erc20Balance)

        setState({
          totalTicket,
          ticketPrice,
          distInterval,
          distCount,
          couponStartTimestamp,
          ticketBuyEndTime,
          nextDistStartTime,
          nftBalance,
          tickets,
          couponResult,
          tokenBaseURI,
          isWinnerTicket,
          couponWinnerAddr,
          erc20Balance,
        });                

        setLoading(false);
      }
    } catch (error) {
      setErrorModal({
        open: true,
        msg: error.message,
      });
    }
  };

  const createContractInstance = () => {
    return new Promise((resolve, reject) => {
      try {
        const contract = new window.web3.eth.Contract(
          distCouponAbi.default,
          couponAddress,
          { from: window.userAddress }
        );

        const erc20 = new window.web3.eth.Contract(
          erc20Abi.default,
          DAI,
          { from: window.userAddress }
        );

        console.log('dss', erc20)

        setErc20Instance(erc20);
        setContractInstance(contract);
        resolve({ contract, erc20 });
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDist = () => {
    contractInstance
      .methods.dist(generateRandom())
      .send()
      .on("transactionHash", () => {
        setProcessing(true);
      })
      .on("receipt", () => {
        setProcessing(false);
        fetchContractData();
      })
      .catch((error) => {
        setProcessing(false);
        setErrorModal({
          open: true,
          msg: error.message,
        });
      });
  };

  const generateRandom = () => {
    return Math.floor(Math.random() * 10 ** 15);
    // should be convert to chainlink
  };

  const getTokenSymbol = () => {
    return "DAI";
  };

  useEffect(() => {
    if (typeof window.ethereum === 'undefined' ||
      !window.ethereum.isConnected() ||
      !window.ethereum.selectedAddress
    ) {
      setLoading(false);
      setShowMetamaskError(true);
    }

    if (typeof window.ethereum !== 'undefined' &&
      window.ethereum.selectedAddress &&
      window.ethereum.isConnected()
    ) {
      fetchContractData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    routes = <Loading />;
  } else {
    routes = (
      <div>
        {showMetamaskError ?
          <AlertModal
            open={showMetamaskError}
            toggle={() => {
                setShowMetamaskError(false);
                history.push('/');
            }}
          >
            <div>
              {typeof window.ethereum === 'undefined' ?
                <div>
                  You can't use these features without Metamask.                                
                </div>
              :
                <div>
                  Please connect to Metamask to use this feature !!
                </div>
              }
            </div>
          </AlertModal>
          :
          <CardDeck>
            <Card className="hidden-card"></Card>

            <Card className="mx-auto view-pool-card">
              <Card.Body style={{ textAlign: "left", fontWeight: "bold" }}>
                <p className="view-pool-header">
                  <u>Distribution Coupon</u>
                </p>

                <Row style={{ paddingBottom: "20px" }}>
                  <Col>
                    <u>Total Tickets</u>
                    <span> :</span>
                    <span className="float-right">
                      {state.totalTicket}
                    </span>
                  </Col>

                  <Col>
                    <u>Ticket Price</u>
                    <span> :</span>
                    <span className="float-right">
                      <span>{state.ticketPrice} </span>
                      {getTokenSymbol()}
                    </span>
                  </Col>
                </Row>

                <Row style={{ paddingBottom: "20px" }}>
                  <Col>
                    <u>Distribution</u>
                    <span> :</span>
                    <span className="float-right">
                      {state.distCount}
                    </span>
                  </Col>

                  <Col>
                    <u>NFT Token</u>
                    <span> :</span>
                    <span className="float-right">
                      {state.tokenBaseURI !== "" ?
                        <a
                          target="_blank"
                          href={state.tokenBaseURI}
                          rel="noreferrer noopener">
                          {nftToken}
                        </a>
                        : <div>{nftToken}</div>
                      }
                    </span>
                  </Col>
                </Row>

                {Number(state.nextDistStartTime) > time.currentUnixTime() ?
                  <Row className="text-center">
                    <Col>
                      <u>Next Distribution In</u>
                      <span> : </span>
                      <span>
                        {time.getRemaingTime(state.nextDistStartTime)}
                      </span>
                    </Col>
                  </Row>
                  :
                  (Number(state.distCount) === Number(state.totalTicket) - 1 &&
                    Number(state.distCount) > 0 ?
                    <div>
                      <div className="auction-alert-message">
                        Token Already Closed
                      </div>
                      <div className="auction-info-message">
                        Win Number: {state.couponResult}
                      </div>
                    </div>
                    : null
                  )
                }

                {time.currentUnixTime() > Number(state.nextDistStartTime) &&
                    Number(state.distCount) < Number(state.totalTicket) - 1 ?
                    <Row className="text-center">
                      <Col>
                        <Button variant="info" onClick={handleDist}>
                          {processing ?
                            <div className="d-flex align-items-center">
                              Processing
                              <span className="loading ml-2"></span>
                            </div>
                            :
                            <div>Execute Distribution</div>
                          }
                        </Button>

                        <div className="info-message">
                          You will get {Number(state.ticketPrice) / 100} {getTokenSymbol()}
                          <span> for executing this distribution.</span>
                        </div>
                      </Col>
                    </Row>
                    : null
                }

                {state.nftBalance > 0 ?
                  <DisplayTickets
                    nftBalance={state.nftBalance}
                    tickets={state.tickets}
                  />
                  : null
                }

                {showBuyTicket ?
                  <BuyTicket
                    couponAddress={couponAddress}
                    contractInstance={contractInstance}
                    erc20Instance={erc20Instance}
                    buyToken={"DAI"}
                    availableBalance={state.erc20Balance}
                    balanceNeeded={state.ticketPrice}
                    callback={fetchContractData}
                  />
                  : null
                }

                {Number(state.isWinnerTicket) !== 0 ?
                  <Claim
                    couponAddress={couponAddress}
                    contractInstance={contractInstance}
                    ticketNumber={state.couponResult}
                    callback={fetchContractData}
                  />
                 :
                  (Number(state.distCount) === Number(state.totalTicket) - 1 &&
                    Number(state.distCount) > 0 && Number(state.nftBalance) > 0 ?
                    (state.couponWinnerAddr === window.userAddress ?
                        <div className="info-message">                                                
                          You have already claimed your coupon
                            for ticket number {state.couponResult}
                        </div>
                      : null
                    ) : (Number(state.nftBalance) > 0 && Number(state.distCount) > 0
                        && Number(state.distCount) === Number(state.totalTicket) - 1 ?
                        <div className="info-message">
                          You don't have winner ticket.
                        </div>
                      : null
                    )
                  )
                }
            </Card.Body>

            {time.currentUnixTime() < Number(state.ticketBuyEndTime) ?
              <Card.Footer className="view-pool-footer">
                <Button
                  onClick={() => setShowBuyTicket(true)}
                  variant="success"
                >
                  {state.nftBalance > 0 ?
                    <div>Buy More Ticket</div>
                    :
                    <div>Want to Buy Ticket ?</div>
                  }
                </Button>
              </Card.Footer>
            :
              (Number(state.nftBalance) === 0 ?
                <div className="alert-message">
                  Participation time over.
                </div>
                : <div style={{ marginBottom: "20px" }}></div>
              )
            }
            </Card>

            <Card className="hidden-card"></Card>
          </CardDeck>
        }

        <AlertModal
          open={errorModal.open}
          toggle={() => setErrorModal({
            ...errorModal, open: false
          })}
        >
          {errorModal.msg}
        </AlertModal>

        <SuccessModal
          open={successModal.open}
          toggle={() => setSuccessModal({
            ...successModal, open: false
          })}
        >
          {successModal.msg}
        </SuccessModal>
      </div >
    );
  }

  return routes;
}
