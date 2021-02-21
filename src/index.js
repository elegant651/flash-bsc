import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initContract } from './web3/init';

if (
  typeof window.ethereum !== 'undefined' &&
  window.ethereum.selectedAddress &&
  window.ethereum.isConnected()
) {
  initContract()
  .then(() => {
    ReactDOM.render(
      <App />,
      document.querySelector('#root')
    )
  }).catch(console.error);
} else if (typeof window.ethereum !== 'undefined') {
  initContract()
  .then(() => {
    ReactDOM.render(
      <App />,
      document.querySelector('#root')
    )
  });
} else {
  ReactDOM.render(
    <App />,
    document.querySelector('#root')
  )
}
