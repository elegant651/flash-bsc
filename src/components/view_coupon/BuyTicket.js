import React, { useState } from "react";
import AlertModal from "../AlertModal";
import SuccessModal from "../SuccessModal";
import { precision } from "../../web3/precision";
import { Row, Col, Button, Card } from "react-bootstrap";

export default function BuyTicket({
  couponAddress,
  contractInstance,
  erc20Instance,
  buyToken,
  availableBalance,
  balanceNeeded,
  callback,
}) {
  const [approving, setApproving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });

  const handleParticipate = async () => {
    try {
      const decimals = Number(
        await erc20Instance.methods.decimals()
          .call()
      );

      console.log(decimals)

      const allowance = await precision.remove(
        await erc20Instance.methods.allowance(
          window.userAddress,
          couponAddress,
        ).call(),
        decimals,
      );

      if (Number(allowance) >= Number(balanceNeeded)) {
        participate();
      } else {
        const success = await approveToken(
          allowance,
          decimals,
        );

        if (success) {
          participate();
        }
      }
    } catch (error) {
      setErrorModal({
        open: true,
        msg: error.message,
      });
    }
  }

  const participate = () => {
    return new Promise((resolve, reject) => {
      contractInstance.methods.buyTicket()
        .send()
        .on('transactionHash', () => {
          setProcessing(true);
        })
        .on('receipt', () => {
          setProcessing(false);
          setSuccessModal({
            open: true,
            msg: "Congratulations 🎉 !! " +
                "You successfully bought ticket !!",
          });
        })
        .catch((error) => {
          setProcessing(false);
          reject(error);
        });
    });
  }

  const approveToken = (allowance, decimals) => {
    return new Promise(async (resolve, reject) => {
      erc20Instance.methods.approve
        (
          couponAddress,
          await precision.add(
            Number(balanceNeeded) - Number(allowance),
            decimals,
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

  return (
    <div>
      <Card
        className="mx-auto form-card text-center"
        style={{ backgroundColor: "rgb(253, 255, 255)" }}
      >
        <Card.Header>
          <u>Buy Ticket</u>
        </Card.Header>

        {Number(availableBalance) >= Number(balanceNeeded) ?
          <Card.Body>
            <Row className="text-center" style={{ paddingBottom: "20px" }}>
              <Col>
                <u>Available Balance</u>
                <span> : </span>
                <span>{availableBalance} {buyToken}</span>
              </Col>
            </Row>

            <Row className="text-center" style={{ paddingBottom: "30px" }}>
              <Col>
                <u>Balance Needed</u>
                <span> : </span>
                <span>{balanceNeeded} {buyToken}</span>
              </Col>
            </Row>

            <Row className="text-center">
              <Col>
                <Button
                  onClick={handleParticipate}
                  variant="outline-success"
                >
                  {approving ?
                    <div className="d-flex align-items-center">
                      Approving
                      <span className="loading ml-2"></span>
                    </div>
                  :
                    (processing ?
                      <div className="d-flex align-items-center">
                        Processing
                        <span className="loading ml-2"></span>
                      </div>
                      : <div>Submit</div>
                    )
                  }
                </Button>
              </Col>
            </Row>
          </Card.Body>
        :
        <Card.Body>
          <div className="alert-message">
            You don't have available balance.
          </div>
        </Card.Body>
        }
      </Card>

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
        onConfirm={callback}
      >
        {successModal.msg}
      </SuccessModal>
    </div >
  );
}
