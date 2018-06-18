import React, { Component } from 'react';
import classNames from 'classnames';
import Search from '../svg/Search';
import './SearchBar.scss';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      open: false
    }
  }

  open = () => {
    this.setState({open: true})
  }

  checkStatus = e => {
    this.setState({open: Boolean(e.target.value)});
  }

  render(){
    return (
      <div className={classNames('searchBar', {open: this.state.open})} onClick={this.open}>
        <input id="search" type="search" onBlur={this.checkStatus} onChange={this.props.search} aria-label="Search"/>
        <label className="icon" htmlFor="search"><Search/></label>
      </div>
    );
  }
}