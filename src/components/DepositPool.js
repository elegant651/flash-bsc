import React, { useEffect, useState } from "react";
import AlertModal from "./AlertModal";
import SuccessModal from "./SuccessModal";
import { precision } from "../web3/precision";
import { config } from '../web3/config';
import history from "./history";

import {
  Row,
  Col,
  Form,
  Card,
  Button,
  CardDeck,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";

export default function DepositPool() {
  let [bep20Instance, setBep20Instance] = useState();
  let [contractInstance, setContractInstance] = useState();
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [depositState, setDepositState] = useState({
    depositTokenAddress: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee", //BUSD
    depositAmt: 0
  })
  const poolAddress = config.depositPoolAddress

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
    { name: "BUSD", address: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee" },
    { name: "DAI", address: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867" }
  ]);

  const fetchContractData = async () => {
    try {
      let result;
      if (!contractInstance) {
        result = await createContractInstance();
      }

      contractInstance = contractInstance ? contractInstance : result.contract;
      bep20Instance = bep20Instance ? bep20Instance : result.bep20;
      

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
        const contract = window.depositPool

        const bep20 = new window.web3.eth.Contract(
            config.bep20Abi,
            depositState.depositTokenAddress,
            { from: window.userAddress }
        );

        setBep20Instance(bep20);
        setContractInstance(contract);
        resolve({ contract, bep20 });
      } catch (error) {
        reject(error);
      }
    });
  };


  const withdraw = async () => {
    window.depositPool.methods
      .withdraw(
        depositState.depositTokenAddress,
        window.userAddress
      )
      .send()
      .on('transactionHash', () => {
        setProcessing(true);
      })
      .on('receipt', (_) => {
        setProcessing(false);
        setSuccessModal({
          open: true,
          msg: "Withdrawing successfully completed !!",
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
  }

  const handleDeposit = async () => {
    try {
      const allowance = await precision.remove(
        await bep20Instance.methods.allowance(
          window.userAddress,
          poolAddress,
        ).call(),
        18
      );

      if (Number(allowance) >= Number(depositState.depositAmt)) {
        depositPool();
      } else {
        const success = await approveToken(allowance);        
        if (success) {
          console.log(success)
          depositPool();
        }
      }
    } catch (error) {
      setErrorModal({
        open: true,
        msg: error.message,
      });
    }
  }

  const approveToken = (allowance) => {
    return new Promise(async (resolve, reject) => {
      bep20Instance.methods.approve
        (
          poolAddress,
          await precision.add(
            Number(depositState.depositAmt) - Number(allowance),
            18
          )
        )
        .send()
        .on('transactionHash', () => {
          setApproving(true);
        })
        .on('receipt', () => {
          setApproving(false);
          resolve(true);
        })
        .catch((error) => {
          setApproving(false);
          reject(error);
        })
    });
  }

  const depositPool = async () => {
    const tokenAddress = depositState.depositTokenAddress
    const amount = depositState.depositAmt
    contractInstance.methods
      .deposit(
        tokenAddress,
        amount
      )
      .send()
      .on('transactionHash', () => {
        setProcessing(true);
      })
      .on('receipt', (_) => {
        setProcessing(false);
        setSuccessModal({
          open: true,
          msg: "Deposit successfully completed !!",
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


  useEffect(() => {
    if (typeof window.ethereum === 'undefined' ||
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
              <u>Deposit Pool</u>
            </Card.Header>

            <Card.Body>
              <Row>
                <Col className="text-header">
                  Deposit Amount:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <Form.Control
                    className="mb-4"
                    type="number"
                    step="0"
                    placeholder="The amount of deposit"
                    onChange={(e) => setDepositState({
                      ...depositState,
                      depositAmt: e.target.value
                    })}
                    style={{ width: "80%" }}
                    value={depositState.depositAmt}
                    required
                  />
                </Col>
              </Row>

              <Row style={{ marginBottom: "30px" }}>
                <Col className="text-header">
                  Token for Deposit:
                </Col>
                <Col style={{ paddingLeft: "0px" }}>
                  <DropdownButton
                    style={{
                      position: "absolute",
                    }}
                    title={tokens.map((element) => (
                        depositState.depositTokenAddress === element.address ?
                        element.name
                        : null
                    ))}
                    variant="outline-info"
                    onSelect={(event) => setDepositState({
                      ...depositState,
                      depositTokenAddress: event
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
            </Card.Body>

            <Card.Footer className="text-center">
              <Button
                onClick={handleDeposit}
                variant="outline-success"
              >
                {processing ?
                    <div className="d-flex align-items-center">
                      Processing
                    <span className="loading ml-2"></span>
                    </div>
                  :
                    <div>Deposit</div>
                }
              </Button>
            </Card.Footer>

            <Card.Footer className="text-center">
              <Button
                onClick={withdraw}
                variant="outline-success"
                >
                {processing ?
                    <div className="d-flex align-items-center">
                    Processing
                    <span className="loading ml-2"></span>
                    </div>
                    :
                    <div>Withdraw</div>
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
