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
axios.interceptors.request.use(request => {
  // Add authorization token to all requests
  if(localStorage.authToken){
    request.headers.Authorization = `Bearer ${localStorage.authToken}`
  }
  return request;
});
axios.interceptors.response.use(response => {
  // Cache auth token
  if(response.headers['x-auth-token']){
    localStorage.setItem('authToken', response.headers['x-auth-token'])
  }
  return response;
});
axios.interceptors.response.use(null, error => {
  if(error.response.status === 401){
    if(!/\/login\/?$/i.test(history.location.pathname)){
      history.push('/login');
    }else if(!/\/api\/auth\/?$/i.test(error.response.request.responseURL)){
      // Remove additional 401 errors if we're not authenticating,
      // this prevents multiple "Invalid Token" error messages
      delete error.response.data.error;
    }
  } 

  return Promise.reject(error);
});

class PrivateRoute extends React.Component{
  constructor(){
    super();
    this.checkToken();
  }

  componentWillUpdate(){
    this.checkToken();
  }

  checkToken = () => {
    this.tokenValid = false;
    if(localStorage.authToken){
      const token = jwt.decode(localStorage.authToken);
      const epoch = Math.floor(Date.now() / 1000);
  
      // Check if token is still valid and not expired
      if(token){
        this.tokenValid = token.exp > epoch;
      }
    }

    if(!this.tokenValid){
      toast('Invalid token. Please login.');
    }
  }

  render(){
    return this.tokenValid
      ?
      <React.Fragment>
        <Sidebar/>
        <Route {...this.props}/>
      </React.Fragment>
      :
      <Redirect to={{pathname: '/login', state: {referrer: this.props.path}}}/>
  }
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
