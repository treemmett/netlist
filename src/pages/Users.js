import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import SearchBar from '../components/SearchBar';
import toast from '../components/Toast';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import serialize from '../utils/serializer';
import Check from '../svg/Check';
import Sad from '../svg/Sad';
import './Users.scss';

@connect(store => {
  return {
    admin: store.login.admin,
    users: store.users.data
  }
})
export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      modal: false,
      currentUser: {}
    }
  }

  search = e => {
    // Remove search result if value is empty
    if(!e.target.value){
      this.setState({search: null});
      return;
    }

    // Escape regex sensitive characters
    const chars = e.target.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // Create regex from search value
    const reg = new RegExp(chars, 'i');

    // Send regex to rendered
    this.setState({search: reg});
  }

  render(){
    const mappedUsers = this.props.users.filter(user => {
      // Apply search filter
      return !this.state.search || this.state.search.test(user.username);
    }).sort((a, b) => {
      // Sort by username
      if(a.username.toLowerCase() > b.username.toLowerCase()) return 1;
      if(a.username.toLowerCase() < b.username.toLowerCase()) return -1;
      return 0;
    }).map(user => {
      // Render users
      return <Row open={this.props.admin ? () => this.setState({modal: true, currentUser: user}) : null} data={user} key={user.username} hover={this.props.admin}/>
    });

    return (
      <React.Fragment>
        <div className="users page">
          {this.state.modal ? <Modal dispatch={this.props.dispatch} currentUser={this.state.currentUser} close={() => this.setState({modal: false, currentUser: {}})}/> : null}
          <div className="actions">
            {this.props.admin ? <div className="btn" onClick={() => this.setState({modal: true})}>New User</div> : null}
            <SearchBar search={this.search}/>
          </div>

          {(this.state.search && !mappedUsers.length) ?
            <div className="sadFace">
              <Sad/>
              <span>No users found</span>
            </div>

            :

            <div className="table">
              <div className="tbl-header">
                <table cellPadding="0" cellSpacing="0" border="0">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Created By</th>
                      <th>Admin</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="tbl-content">
                <table cellPadding="0" cellSpacing="0" border="0">
                  <tbody>
                    {mappedUsers}
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </React.Fragment>
    );
  }
}

const Row = props => (
  <tr onClick={props.open} className={classNames({hover: props.hover})}>
    <td>{props.data.username}</td>
    <td>{props.data.createdBy}</td>
    <td>{props.data.admin ? <Check/> : ''}</td>
  </tr>
);

class Modal extends Component{
  constructor(props){
    super(props);
    this.state = {
      disabled: false
    }
  }

  save = e => {
    e.preventDefault();

    // Serialize data
    const data = serialize(e.target);

    // Check if passwords match
    if(data.password !== data.password2){
      toast('Passwords don\'t match');
      return;
    }

    // Lock form
    this.setState({disabled: true});

    const update = Boolean(this.props.currentUser.username);
    axios({
      method: update ? 'PUT' : 'POST',
      url: '/users' + (update ? '/'+encodeURIComponent(this.props.currentUser.username.toLowerCase()) : ''),
      data: data
    }).then(res => {
      // Update store
      this.props.dispatch({
        type: update ? 'UPDATE_USER' : 'ADD_USER',
        payload: res.data
      });
      this.props.close();
    }).catch(err => {
      this.setState({disabled: false});
      axiosErrorHandler(err);
    });
  }

  delete = () => {
    if(!window.confirm('Are you sure you want to delete '+this.props.currentUser.username+'?')){
      return;
    }

    axios.delete('/users/'+encodeURIComponent(this.props.currentUser.username.toLowerCase())).then(() => {
      // Update store
      this.props.dispatch({
        type: 'REMOVE_USER',
        payload: this.props.currentUser.username
      });
      this.props.close();
    }).catch(axiosErrorHandler);
  }

  render(){
    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          <fieldset disabled={this.state.disabled}>
            <form className="grid" onSubmit={this.save}>
              <label htmlFor="username">Username</label>
              <input value={this.props.currentUser.username} readOnly={this.props.currentUser.username} type="text" id="username" name="username" required autoFocus/>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required={!this.props.currentUser.username}/>
              <label htmlFor="password2">Confirm Password</label>
              <input type="password" id="password2" name="password2" required={!this.props.currentUser.username}/>
              <label htmlFor="admin">Admin</label>
              <input defaultChecked={this.props.currentUser.admin} className="checkbox" type="checkbox" id="admin" name="admin"/>
              <label className="checkbox icon" htmlFor="admin"><Check/></label>
              <div className="actions">
                <input type="button" className="btn secondary" value="Cancel" onClick={this.props.close}/>
                {this.props.currentUser.username ? <input type="button" className="btn red" value="Delete" onClick={this.delete}/> : null}
                <input type="submit" className="btn" value="Save"/>
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    );
  }
}