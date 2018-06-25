import React, { Component } from 'react';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import parseTime from '../utils/parseTime';
import Check from '../svg/Check';
import Sad from '../svg/Sad';
import './Users.scss';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
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
          <div className="actions">
            <div className="btn">New User</div>
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