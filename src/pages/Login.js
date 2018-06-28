import React, { Component } from 'react';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import serialize from '../utils/serializer';
import './Login.scss';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      disabled: false
    }
  }

  login = e => {
    e.preventDefault();
    this.setState({disabled: true});
    const data = serialize(e.target);

    // Send login request
    axios.post('/auth', data).then(res => {
      this.props.history.push('/');
    }).catch(err => {
      this.setState({disabled: false});
      axiosErrorHandler(err);
    });
  }

  render(){
    return(
      <div className="page login">
        <div className="card">
          <fieldset disabled={this.state.disabled}>
            <form className="grid" onSubmit={this.login}>
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username"/>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password"/>
              <div className="actions"><input className="btn" type="submit" value="Login"/></div>
            </form>
          </fieldset>
        </div>
      </div>
    );
  }
}