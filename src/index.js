import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Toaster } from './components/Toast';

// Global styles
import './index.scss';
import './components/Components.scss';

// Components
import NameKey from './pages/NameKey';
import ServerList from './pages/ServerList';
import Sidebar from './components/Sidebar';

// Configure global API settings
axios.defaults.baseURL = '/netlist/api';

const Render = () => (
  <Router>
    <React.Fragment>
      <Sidebar/>

      <Switch>
        <Route exact path="/servers" component={ServerList}/>

        <Route exact path="/namekey" component={NameKey}/>
      </Switch>
      <Toaster/>
    </React.Fragment>
  </Router>
);

ReactDOM.render(<Render/>, document.getElementById('root'));
