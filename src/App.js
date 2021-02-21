import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {
  Switch,
  HashRouter,
  Route,
  Redirect,
} from "react-router-dom";
import history from './components/history';
import Header from './components/Header';
// import Main from './components/Main';
import PoolMain from './components/PoolMain';
import DepositPool from './components/DepositPool';
import FlashSwap from './components/FlashSwap';


function App() {
  const routes = (
    <Switch>
      {/* <Route path="/" exact>
        <Main />
      </Route> */}
      <Route path="/" exact>
        <PoolMain />
      </Route>

      <Route path="/deposit-pool" exact>
        <DepositPool />
      </Route>
      <Route path="/flash-swap" exact>
        <FlashSwap />
      </Route>
      <Redirect to="/" />
    </Switch>
  );

  return (
    <div className="App">      
      <HashRouter history={history}>
        <Header />
        {routes}
      </HashRouter>
    </div>
  );
}

export default App;
