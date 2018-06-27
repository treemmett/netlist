import { Redirect, Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import history from './utils/history';
import jwt from 'jsonwebtoken';
import toast, { Toaster } from './components/Toast';

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
    localStorage.setItem('authToken', response.headers['x-auth-token'])
  }
  return response;
});

const PrivateRoute = props => {
  let tokenValid = false;

  // Check if token exists
  if(localStorage.authToken){
    const token = jwt.decode(localStorage.authToken);
    const epoch = Math.floor(Date.now() / 1000);

    // Check if token is still valid and not expired
    tokenValid = token.exp > epoch;
  }

  if(!tokenValid){
    toast('Session expired. Please login');
  }
  

  return tokenValid
    ?
    <React.Fragment>
      <Sidebar/>
      <Route {...props}/>
    </React.Fragment>
    :
    <Redirect to={{pathname: '/login', state: {referrer: props.path}}}/>
}

const Render = () => (
  <Router history={history}>
    <React.Fragment>
      <Switch>
        <PrivateRoute exact path="/" component={Console}/>
        <PrivateRoute exact path="/servers" component={ServerList}/>
        <PrivateRoute exact path="/namekey" component={NameKey}/>
        <PrivateRoute exact path="/users" component={Users}/>

        <Route exact path="/login" component={Login}/>
      </Switch>
      <Toaster/>
    </React.Fragment>
  </Router>
);

ReactDOM.render(<Render/>, document.getElementById('root'));
