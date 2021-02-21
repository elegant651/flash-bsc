import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import AlertModal from "./AlertModal";
import SuccessModal from "./SuccessModal";
import { Button, Card, CardDeck } from "react-bootstrap";

export default function Faucet() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });
  const [tokens] = useState([
    {
      name: "DAI",
      address: "0x5A01Ea01Ba9A8DC2B066714A65E61a78838B1b9e",
      status: false
    }
  ]);

  const handleGetTestTokens = (tokenAddress) => {
    window.tokenFaucet.methods
      .claimTestTokens(tokenAddress)
      .send()
      .on('transactionHash', () => {
        setProcessing(true);
      })
      .on('receipt', (_) => {
        setProcessing(false);
      })
      .catch((error) => {
        setProcessing(false);
        setErrorModal({
          open: true,
          msg: error.message,
        });
      });
  }

  const checkIsAlreadyClaimed = () => {
    tokens.forEach(async (token, i) => {
      console.log('ff', token.address)
      const status = await window.tokenFaucet
        .methods.alreadyClaimed(
          window.userAddress,
          token.address,
        ).call();

      tokens[i].status = status;

      if (i === tokens.length - 1) {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    checkIsAlreadyClaimed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

if (loading) {
  return <Loading />
};

return (
  <div>
    <CardDeck>
      <Card className="hidden-card"></Card>
        <Card className="view-pool-card">
          <Card.Header>
            <u>Token Faucet</u>
          </Card.Header>

          <Card.Body>
            <div style={{ marginBottom: "30px" }}>
              <strong>If you want to get token</strong>
                <br />Please use <a
                    target="_blank"                    
                    href="https://testnet.aave.com/faucet"
                    style={{ fontWeight: "bold" }}
                > Faucet </a>                
            </div>

            {tokens.map((token, key) => (
              <Card
                key={key}
                className="mx-auto form-card text-center"
                style={{
                    backgroundColor: "rgb(253, 255, 255)",
                    marginTop: "4%",
                    marginBottom: "4%"
                }}>
                <Card.Header>
                  <u>{token.name} Faucet</u>
                </Card.Header>

                {!token.status ?
                  <Card.Body>
                    <p>
                      You can get Test <strong>{token.name} </strong>
                    </p>
                    <Button
                      style={{ marginTop: '10px' }}
                      variant="success"
                      onClick={() =>
                        handleGetTestTokens(token.address)
                      }
                    >
                    {processing ?
                      <div className="d-flex align-items-center">
                        Processing
                        <span className="loading ml-2"></span>
                      </div>
                        :
                      <div>
                        GET 100 {token.name}
                      </div>
                    }
                    </Button>
                  </Card.Body>
                  :
                  <Card.Body>
                    <p style={{ color: "gray" }}>
                      You have already claimed your 100 {token.name}.
                    </p>                    
                  </Card.Body>
                  }
                </Card>
              ))}
            </Card.Body>
          </Card>

          <Card className="hidden-card"></Card>
        </CardDeck>


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
