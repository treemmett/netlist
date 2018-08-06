import { Redirect, BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Toaster } from './components/Toast';
import { Provider, connect } from 'react-redux';
import store from './redux/store';
import getData from './utils/dataManager';

// Global styles
import './index.scss';
import './components/Components.scss';

// Components
import Console from './pages/Console';
import Login from './pages/Login';
import Logout from './pages/Logout';
import NameKey from './pages/NameKey';
import ServerList from './pages/ServerList';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';

// Configure global API settings
axios.defaults.baseURL = '/api';
axios.interceptors.request.use(request => {
  // Add authorization token to all requests
  if(store.getState().login.token){
    request.headers.Authorization = `Bearer ${store.getState().login.token}`
  }
  return request;
});
axios.interceptors.response.use(response => {
  if(response.headers['x-auth-token']){
    // Cache token in storage
    localStorage.setItem('authToken', response.headers['x-auth-token']);

    // Send token data to store
    store.dispatch({
      type: 'SET_LOGIN',
      payload: {
        ...jwt.decode(response.headers['x-auth-token']),
        token: response.headers['x-auth-token']
      }
    });
  }
  return response;
});
axios.interceptors.response.use(null, error => {
  if(error.response.status === 401){
    if(!/\/login\/?$/i.test(window.location.pathname)){
      //Remove login data
      localStorage.clear();
      store.dispatch({
        type: 'RESET_LOGIN'
      });
    }else if(!/\/api\/auth\/?$/i.test(error.response.request.responseURL)){
      // Remove additional 401 errors if we're not authenticating,
      // this prevents multiple "Invalid Token" error messages
      delete error.response.data.error;
    }
  } 

  return Promise.reject(error);
});

// Setup API fetching
getData();

@connect(store => {
  return {
    loggedIn: store.login.loggedIn,
    tokenExp: store.login.expires
  }
})
class PrivateRoute extends React.Component{
  componentWillUpdate(props){
    // Check token expiration
    const time = Math.floor(Date.now() / 1000);
    if(this.props.tokenExp && time > props.tokenExp){
      this.props.dispatch({type: 'RESET_LOGIN'});
    }
  }
  render(){
    return this.props.loggedIn ?
      <React.Fragment>
        <Sidebar/>
        <Route exact={this.props.exact} path={this.props.path} component={this.props.component}/>
      </React.Fragment>
      :
      <Redirect to={{
        pathname: '/login',
        state: {referrer: this.props.path}
      }}/>
  }
}

const Render = () => (
  <Router>
    <React.Fragment>
      <Switch>
        <PrivateRoute exact path="/" component={Console}/>
        <PrivateRoute exact path="/servers" component={ServerList}/>
        <PrivateRoute exact path="/namekey" component={NameKey}/>
        <PrivateRoute exact path="/settings" component={Settings}/>

        <Route exact path="/login" component={Login}/>
        <Route exact path="/logout" component={Logout}/>
      </Switch>
      <Toaster/>
    </React.Fragment>
  </Router>
);

ReactDOM.render(<Provider store={store}><Render/></Provider>, document.getElementById('root'));
