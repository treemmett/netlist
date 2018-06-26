import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Toaster } from './components/Toast';

// Global styles
import './index.scss';
import './components/Components.scss';

// Components
import Console from './pages/Console';
import Login from './pages/Login';
import NameKey from './pages/NameKey';
import ServerList from './pages/ServerList';
import Sidebar from './components/Sidebar';
import Users from './pages/Users';

// Configure global API settings
axios.defaults.baseURL = '/netlist/api';
axios.interceptors.response.use(response => {
  // Cache auth token
  if(response.headers['x-auth-token']){
    localStorage.setItem('authtoken', response.headers['x-auth-token'])
  }
  return response;
});

const Render = () => (
  <Router>
    <React.Fragment>
      <Sidebar/>

      <Switch>
        <Route exact path="/" component={Console}/>

        <Route exact path="/servers" component={ServerList}/>

        <Route exact path="/namekey" component={NameKey}/>

        <Route exact path="/users" component={Users}/>

        <Route exact path="/login" component={Login}/>
      </Switch>
      <Toaster/>
    </React.Fragment>
  </Router>
);

ReactDOM.render(<Render/>, document.getElementById('root'));
