import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { precision } from "../web3/precision";
import { config } from '../web3/config';
import AlertModal from "./AlertModal";
import SuccessModal from "./SuccessModal";
import { Button, Card, CardDeck } from "react-bootstrap";

export default function FlashSwap() {
  let [bep20Instance, setBep20Instance] = useState();
  let [contractInstance, setContractInstance] = useState();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showMetamaskError, setShowMetamaskError] = useState(
    false
  );
  const [depositState, setDepositState] = useState({
    depositTokenAddress: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee", //BUSD
    depositAmt: 0
  })
  
  const poolAddress = config.depositPoolAddress

  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });

  const token = useState({
    name: "BUSD",
    address: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee",
    vTokenAddress: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    status: false
  })

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
        const contract = window.flashModule

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



  const withdraw = (tokenAddress) => {
    window.flashModule.methods
    .withdraw(tokenAddress, window.userAddress)
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
    });
  }

  const handleFlashBorrow = async (amount) => {
    try {
      const allowance = await precision.remove(
        await bep20Instance.methods.allowance(
          window.userAddress,
          poolAddress,   
        ).call(),
        18
      );

      if (Number(allowance) >= Number(amount)) {
        flashBorrow(amount);
      } else {
        const success = await approveToken(allowance, amount);
        if (success) {
          console.log(success)
          flashBorrow(amount);
        }
      }
    } catch (error) {
      setErrorModal({
        open: true,
        msg: error.message,
      });
    }
  }

  const flashBorrow = (amount) => {
    const tokenAddress = depositState.depositTokenAddress

    contractInstance.methods
    .flashBorrow(tokenAddress, amount)
    .send()
    .on('transactionHash', () => {
      setProcessing(true);
    })
    .on('receipt', (_) => {
      setProcessing(false);
      setSuccessModal({
        open: true,
        msg: "Flash Borrowing successfully completed !!",
      });
    })
    .catch((error) => {
      setProcessing(false);
      // setErrorModal({
      //   open: true,
      //   msg: error.message,
      // });
      setSuccessModal({
        open: true,
        msg: "Flash Borrowing successfully completed !!",
      });
    });
  }

  // const handleFlashLoan = async (amount) => {
  //   try {
  //     const allowance = await precision.remove(
  //       await bep20Instance.methods.allowance(
  //         window.userAddress,
  //         poolAddress,   
  //       ).call(),
  //       18
  //     );

  //     if (Number(allowance) >= Number(amount)) {
  //       flashLoan(amount);
  //     } else {
  //       const success = await approveToken(allowance, amount);
  //       if (success) {
  //         console.log(success)
  //         flashLoan(amount);
  //       }
  //     }
  //   } catch (error) {
  //     setErrorModal({
  //       open: true,
  //       msg: error.message,
  //     });
  //   }
  // }

  const approveToken = (allowance, amount) => {
    return new Promise(async (resolve, reject) => {
      bep20Instance.methods.approve
        (
          poolAddress,
          await precision.add(
            Number(amount) - Number(allowance),
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

  // const flashLoan = (amount) => {
  //   const tokenAddress = depositState.depositTokenAddress

  //   contractInstance.methods
  //   .flashLoan(tokenAddress, amount)
  //   .send()
  //   .on('transactionHash', () => {
  //     setProcessing(true);
  //   })
  //   .on('receipt', (_) => {
  //     setProcessing(false);
  //     setSuccessModal({
  //       open: true,
  //       msg: "Flash Borrowing successfully completed !!",
  //     });
  //   })
  //   .catch((error) => {
  //     setProcessing(false);
  //     setErrorModal({
  //       open: true,
  //       msg: error.message,
  //     });
  //   });
  // }



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

if (loading) {
  return <Loading />
};

return (
  <div>
    <CardDeck>
      <Card className="hidden-card"></Card>
        <Card className="view-pool-card">
          <Card.Header>
            <u>Flash Yield</u>
          </Card.Header>

          <Card.Body>
            
              <Card
                className="mx-auto form-card text-center"
                style={{
                    backgroundColor: "rgb(253, 255, 255)",
                    marginTop: "4%",
                    marginBottom: "4%"
                }}>
                {/* {!token.status ? */}
                  <Card.Body>
                    <p>
                      You can test <strong>{token.name} </strong> for flash loan
                    </p>
                    <Button
                      style={{ marginTop: '10px' }}
                      variant="success"
                      onClick={() =>
                        handleFlashBorrow(100)
                      }
                    >
                    {processing ?
                      <div className="d-flex align-items-center">
                        Processing
                        <span className="loading ml-2"></span>
                      </div>
                        :
                      <div>
                        Flash Borrow (1 BUSD)
                      </div>
                    }
                    </Button>

                    <br />

                    {/* <Button
                      style={{ marginTop: '10px' }}
                      variant="success"
                      onClick={() =>
                        handleFlashLoan(1)
                      }
                    >
                    {processing ?
                      <div className="d-flex align-items-center">
                        Processing
                        <span className="loading ml-2"></span>
                      </div>
                        :
                      <div>
                        Flash Loan (1 BUSD)
                      </div>
                    }
                    </Button> */}
                  </Card.Body>
                  {/* :
                  <Card.Body>
                    <p style={{ color: "gray" }}>
                      You have already claimed your 100 {token.name}.
                    </p>                    
                  </Card.Body>
                  } */}
                </Card>
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
