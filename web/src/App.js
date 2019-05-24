import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import LINEPay from './pages/LINEPay';
import Thankyou from './pages/Thankyou';

class App extends Component {
  render() {
    return (
      <div className="app">
        <header className="app-header">
          <h3 className="app-title">Rabbit LINE Pay Demo</h3>
        </header>
        <Router>
          <div>
            <Route exact path="/" component={LINEPay} />
            <Route path="/thankyou" component={Thankyou} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
