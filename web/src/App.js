import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from 'mobx-react';
import mobxStore from './stores/store.js';
import Menu from './Menu/Menu';

class App extends Component {
  render() {
    return (
      <Provider {...mobxStore}>
        <Router>
          <Switch>
            <Route exact path="/" component={Menu} />
            <Route path="/menu" component={Menu} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}

export default App;