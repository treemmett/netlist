import React, { Component } from 'react';
import SearchBar from '../components/SearchBar';
import toast from '../components/Toast';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import parseTime from '../utils/parseTime';
import serialize from '../utils/serializer';
import Check from '../svg/Check';
import Sad from '../svg/Sad';
import './Users.scss';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      modal: false,
      currentUser: {},
      users: []
    }
  }

  componentDidMount(){
    this.refresh();
  }

  refresh = () => {
    axios.get('/users').then(res => this.setState({users: this.sort(res.data)})).catch(axiosErrorHandler);
  }

  sort = data => {
    data.sort(((a, b) => {
      if(a.username.toLowerCase() > b.username.toLowerCase()) return 1;
      if(a.username.toLowerCase() < b.username.toLowerCase()) return -1;
      return 0;
    }));

    return data;
  }

  search = e => {
    // Remove search result if value is empty
    if(!e.target.value){
      this.setState({searchResult: null});
      return;
    }

    // Escape regex sensitive characters
    const chars = e.target.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // Create regex from search value
    const reg = new RegExp(chars, 'i');

    // Find data that matches search result
    const data = this.state.users.filter(obj => reg.test(obj.username));

    this.setState({searchResult: data});
  }

  addData = data => {
    console.log(data);
    this.setState({users: this.sort([...this.state.users, data])});
  }

  render(){
    const rows = [];

    // Show search result, or all data
    const viewset = this.state.searchResult ? this.state.searchResult : this.state.users;

    while(rows.length < viewset.length){
      rows.push(<Row openDetails={this.openDetails} data={viewset[rows.length]} key={rows.length}/>);
    }

    return (
      <React.Fragment>
        <div className="users page">
          {this.state.modal ? <Modal save={this.addData} close={() => this.setState({modal: false, currentUser: {}})}/> : null}
          <div className="actions">
            <div className="btn" onClick={() => this.setState({modal: true})}>New User</div>
            <SearchBar search={this.search}/>
          </div>

          {(this.state.searchResult && !rows.length) ?
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
                      <th>Last Login</th>
                      <th>Created</th>
                      <th>Created By</th>
                      <th>Admin</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="tbl-content">
                <table cellPadding="0" cellSpacing="0" border="0">
                  <tbody>
                    {rows}
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
  <tr>
    <td>{props.data.username}</td>
    <td>{parseTime(props.data.lastLogin)}</td>
    <td>{parseTime(props.data.createdAt)}</td>
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

    axios.post('/users', data).then(res => {
      this.props.save(res.data);
      this.props.close();
    }).catch(err => {
      this.setState({disabled: false});
      axiosErrorHandler(err);
    });
  }

  render(){
    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          <fieldset disabled={this.state.disabled}>
            <form className="grid" onSubmit={this.save}>
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" required autoFocus/>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required/>
              <label htmlFor="password2">Confirm Password</label>
              <input type="password" id="password2" name="password2" required/>
              <label htmlFor="admin">Admin</label>
              <input className="checkbox" type="checkbox" id="admin" name="admin"/>
              <label className="checkbox icon" htmlFor="admin"><Check/></label>

              <div className="actions">
                <input type="button" className="btn secondary" value="Cancel" onClick={this.props.close}/>
                <input type="submit" className="btn" value="Save"/>
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    );
  }
}