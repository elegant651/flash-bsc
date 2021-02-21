import Web3 from 'web3';
import { config } from './config';

export async function initContract() {
  window.web3 = new Web3(window.ethereum);
  await window.ethereum.enable();

  window.userAddress = (
    await window.web3.eth.getAccounts()
  )[0];

  window.depositPool = new window.web3.eth.Contract(
    config.depositPoolAbi,
    config.depositPoolAddress,
    { from: window.userAddress }
  );

  window.flashModule = new window.web3.eth.Contract(
    config.flashModuleAbi,
    config.flashModuleAddress,
    { from: window.userAddress }
  );

  window.ethInitialized = true;

  window.ethereum.on('accountsChanged', () => {
    window.location.reload();
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}