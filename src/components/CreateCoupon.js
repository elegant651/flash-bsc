import React, { useEffect, useState } from "react";
import ipfsClient from "ipfs-http-client";
import AlertModal from "./AlertModal";
import SuccessModal from "./SuccessModal";
import history from "./history";
import {
  Row,
  Col,
  Form,
  Card,
  Image,
  Button,
  CardDeck,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";

export default function CreateCoupon() {
  const [deploying, setDeploying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [addCouponState, setAddCouponState] = useState({
    couponTokenName: "",
    couponTokenSymbol: "",
    ticketPrice: "",
    distInterval: "",
    ticketBuyDuration: "",
    ticketBuyToken: "0x2B8fF854c5e16cF35B9A792390Cc3a2a60Ec9ba2",
    image: null,
  });

  const [showMetamaskError, setShowMetamaskError] = useState(
    false
  );
  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });
  const [tokens] = useState([
    { name: "DAI", address: "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd" }
  ]);

  const ipfs = ipfsClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
  });

  const handleCreateCoupon = async () => {
    let tokenBaseUrl = "";
    if (addCouponState.image) {
      setDeploying(true);
      const ipfsHash = await deployImage();
      tokenBaseUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      setDeploying(false);
    }

    console.log(addCouponState)

    window.couponFactory.methods
      .addCoupon(
        addCouponState.couponTokenName,
        addCouponState.couponTokenSymbol,
        addCouponState.ticketBuyToken,
        addCouponState.ticketPrice,
        addCouponState.distInterval,
        addCouponState.ticketBuyDuration,
        tokenBaseUrl,
      )
      .send()
      .on('transactionHash', () => {
        setProcessing(true);
      })
      .on('receipt', (_) => {
        setProcessing(false);
        setSuccessModal({
          open: true,
          msg: "Coupon successfully created !!",
        });
      })
      .catch((error) => {
        setProcessing(false);
        setErrorModal({
          open: true,
          msg: error.message,
        });
        console.log(error.message)
      });
  };

  const deployImage = () => {
    return new Promise((resolve) => {
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(addCouponState.image);

      reader.onloadend = async () => {
        const files = [{
          path: addCouponState.image.name,
          content: reader.result
        }];

        for await (const result of ipfs.addAll(files)) {
          resolve(result.cid.string);
        }
      }
    });
  }

  useEffect(() => {
    if (typeof window.ethereum === 'undefined' ||
        !window.ethereum.selectedAddress
    ) {
      setShowMetamaskError(true);
    }
  }, []);

  return (
    <div style={{ marginTop: "5%" }}>
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
                You should install Metamask first.                                
              </div>
              :
              <div>
                Please connect to Metamask.
              </div>
            }
          </div>
        </AlertModal>
      :
        <CardDeck>
          <Card className="hidden-card"></Card>

          <Card className="mx-auto create-card">
            <Card.Header>
              <u>Create Distribution Coupon</u>
            </Card.Header>

            <Card.Body>
              <Row style={{ marginTop: "10px" }}>
                <Col className="text-header">
                  Coupon Token Name:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <Form.Control
                    className="mb-4"
                    type="text"
                    placeholder="NFT Token Name"
                    onChange={(e) => setAddCouponState({
                        ...addCouponState,
                        couponTokenName: e.target.value
                    })}
                    style={{ width: "80%" }}
                    value={addCouponState.couponTokenName}
                    required
                  />
                </Col>
              </Row>

              <Row>
                <Col className="text-header">
                  Coupon Token Symbol:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <Form.Control
                    className="mb-4"
                    type="text"
                    placeholder="NFT Token Symbol"
                    onChange={(e) => setAddCouponState({
                        ...addCouponState,
                        couponTokenSymbol: e.target.value
                    })}
                    style={{ width: "80%" }}
                    value={addCouponState.couponTokenSymbol}
                    required
                  />
                </Col>
              </Row>

              <Row>
                <Col className="text-header">
                  NFT Token Image:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <Form.Control
                    className="mb-4"
                    type="file"
                    onChange={(event) => setAddCouponState({
                      ...addCouponState,
                      image: event.target.files[0]
                    })}
                    style={{ width: "80%" }}
                    required
                  />
                </Col>
              </Row>

              <Row>
                <Col className="text-header">
                  Ticket Price:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <Form.Control
                    className="mb-4"
                    type="number"
                    step="0"
                    placeholder="Price of the ticket"
                    onChange={(e) => setAddCouponState({
                      ...addCouponState,
                      ticketPrice: e.target.value
                    })}
                    style={{ width: "80%" }}
                    value={addCouponState.ticketPrice}
                    required
                  />
                </Col>
              </Row>

              <Row>
                <Col className="text-header">
                  Distribution Interval:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <Form.Control
                    className="mb-4"
                    type="number"
                    step="0"
                    placeholder="In minutes (Eg. 15)"
                    onChange={(e) => setAddCouponState({
                      ...addCouponState,
                      distInterval: e.target.value
                    })}
                    style={{ width: "80%" }}
                    value={addCouponState.distInterval}
                    required
                  />
                </Col>
              </Row>

              <Row>
                <Col className="text-header">
                  Duration for buy:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <Form.Control
                    className="mb-4"
                    type="number"
                    step="0"
                    placeholder="In minutes (Eg. 30)"
                    onChange={(e) => setAddCouponState({
                      ...addCouponState,
                      ticketBuyDuration: e.target.value
                    })}
                    style={{ width: "80%" }}
                    value={addCouponState.ticketBuyDuration}
                    required
                  />
                </Col>
              </Row>

              <Row style={{ marginBottom: "30px" }}>
                <Col className="text-header">
                  Token For Buy:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <DropdownButton
                    style={{
                      position: "absolute",
                    }}
                    title={tokens.map((element) => (
                      addCouponState.ticketBuyToken === element.address ?
                        element.name
                        : null
                    ))}
                    variant="outline-info"
                    onSelect={(event) => setAddCouponState({
                      ...addCouponState,
                      ticketBuyToken: event
                    })}
                  >
                    {tokens.map((element, key) => (
                      <Dropdown.Item
                        key={key}
                        eventKey={element.address}
                      >
                        {element.name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </Col>
              </Row>              

              {addCouponState.image ?
                <Row>
                  <Col>
                    <Image
                      src={URL.createObjectURL(
                        addCouponState.image
                      )}
                      width="150"
                      height="150">
                    </Image>
                  </Col>
                </Row>
                : null
              }
            </Card.Body>

            <Card.Footer className="text-center">
              <Button
                onClick={handleCreateCoupon}
                variant="outline-success"
              >
                {deploying ?
                  <div className="d-flex align-items-center">
                    <span>Deploying to IPFS</span>
                    
                    <span className="loading ml-2"></span>
                  </div>
                  :
                  (processing ?
                    <div className="d-flex align-items-center">
                      Processing
                    <span className="loading ml-2"></span>
                    </div>
                  :
                    <div>Submit</div>
                  )
                }
              </Button>
            </Card.Footer>
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
        onConfirm={() => history.push("/")}
      >
        {successModal.msg}
      </SuccessModal>
    </div>
  );
}
