import React, { Component } from 'react';
import { connect } from'react-redux';
import classNames from 'classnames';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import serialize from '../utils/serializer';
import parseText from '../utils/parseText';
import './NameKey.scss';

// Vectors
import PlusCircle from '../svg/PlusCircle';
import Sad from '../svg/Sad';

@connect(store => {
  return {
    admin: store.login.admin,
    locations: store.locations.data,
    purposes: store.purposes.data
  }
})
export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      openData: [],
      modal: false,
    }
  }

  open = (field, data) => {
    this.setState({modal: field, openData: data});
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

    // Send regex to renderer
    this.setState({search: reg});
  }

  render(){
    const mappedLocations = this.props.locations.filter(obj => {
      // Apply search
      return !this.state.search || this.state.search.test(obj.code) || this.state.search.test(obj.description);
    }).sort(((a, b) => {
      // Sort by code
      if(a.code.toString().toLowerCase() > b.code.toString().toLowerCase()) return 1;
      if(a.code.toString().toLowerCase() < b.code.toString().toLowerCase()) return -1;
      return 0;
    })).map((obj) => {
      // Render item
      return <Row onClick={this.props.admin ? () => this.open('locations', obj) : null} key={obj.code} code={obj.code} description={obj.description} hover={this.props.admin}/>;
    });

    const mappedPurposes = this.props.purposes.filter(obj => {
      // Apply search
      return !this.state.search || this.state.search.test(obj.code) || this.state.search.test(obj.description);
    }).sort(((a, b) => {
      // Sort by code
      if(a.code.toString().toLowerCase() > b.code.toString().toLowerCase()) return 1;
      if(a.code.toString().toLowerCase() < b.code.toString().toLowerCase()) return -1;
      return 0;
    })).map((obj) => {
      // Render item
      return <Row onClick={this.props.admin ? () => this.open('purposes', obj) : null} key={obj.code} code={obj.code} description={obj.description} hover={this.props.admin}/>;
    });

    return (
      <div className="page namingScheme">
        {this.state.modal ? <Modal dispatch={this.props.dispatch} field={this.state.modal} data={this.state.openData} close={() => this.setState({modal: false, openData: {}})}/> : null}
        <div className="actions">
          <SearchBar search={this.search}/>
        </div>

        {(this.state.search && !mappedLocations.length && !mappedPurposes.length) ?
          <div className="sadFace">
            <Sad/>
            <span>No results found</span>
          </div>

          :

          <div className="tables">
            <div className="table">
              <div className="tbl-header">
                {this.props.admin ? <div className="icon click" onClick={() => this.setState({modal: 'locations'})}><PlusCircle/></div> : null}
                <table cellPadding="0" cellSpacing="0" border="0">
                  <thead>
                    <tr>
                      <th>Prefix</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="tbl-content">
                <table cellPadding="0" cellSpacing="0" border="0">
                  <tbody>{mappedLocations}</tbody>
                </table>
              </div>
            </div>

            <div className="table">
              <div className="tbl-header">
                {this.props.admin ? <div className="icon click" onClick={() => this.setState({modal: 'purposes'})}><PlusCircle/></div> : null}
                <table cellPadding="0" cellSpacing="0" border="0">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="tbl-content">
                <table cellPadding="0" cellSpacing="0" border="0">
                  <tbody>{mappedPurposes}</tbody>
                </table>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

const Row = props => (
  <tr onClick={props.onClick} className={classNames({hover: props.hover})}>
    <td>{props.code}</td>
    <td>{props.description}</td>
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

    // Lock form
    this.setState({disabled: true});

    const update = Boolean(this.props.data.code);

    // Send request
    axios({
      method: update ? 'PUT' : 'POST',
      url: update ? '/'+this.props.field+'/'+encodeURIComponent(this.props.data.id) : '/'+this.props.field,
      data: data
    }).then(res => {
      const field = this.props.field === 'locations' ? 'LOCATION' : 'PURPOSE';

      // Update store
      this.props.dispatch({
        type: update ? 'UPDATE_'+field : 'ADD_'+field,
        payload: res.data
      });

      // Close modal
      this.props.close();
    }).catch(err => {
      // Unlock form
      this.setState({disabled: false});

      axiosErrorHandler(err);
    });
  }

  delete = () => {
    if(!window.confirm(`Are you sure you want to delete ${this.props.data.code} - ${this.props.data.description}?`)){
      return;
    }

    axios.delete(`/${this.props.field}/${encodeURIComponent(this.props.data.code)}`).then(() => {
      const field = this.props.field === 'locations' ? 'LOCATION' : 'PURPOSE';
      
      // Update store
      this.props.dispatch({
        type: 'REMOVE_'+field,
        payload: this.props.data.code
      });

      this.props.close();
    }).catch(axiosErrorHandler);

  }

  render(){
    // Unique settings for fieldsets
    const config = this.props.field === 'locations' ? {
      description: 'Location',
      code: 'Prefix',
      formatter: e => {
        parseText(e, {
          type: 'text',
          length: 3,
          trim: true,
          uppercase: true
        });
      }
    } : {
      description: 'Purpose',
      code: 'Code',
      formatter: e => {
        parseText(e, {
          type: 'number',
          length: 2,
          trim: true
        });
      }
    }

    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          <fieldset disabled={this.state.disabled}>
            <form className="grid" onSubmit={this.save}>
              <label htmlFor="code">{config.code}</label>
              <input onChange={config.formatter} defaultValue={this.props.data.code} id="code" name="code" type="text" autoFocus required/>
              <label htmlFor="description">{config.description}</label>
              <input defaultValue={this.props.data.description} id="description" name="description" type="text" required/>
              <div className="actions">
                <input onClick={this.props.close} className="btn secondary" type="button" value="Cancel"/>
                {this.props.data.code ? <input onClick={this.delete} className="btn red" type="button" value="Delete"/> : null}
                <input className="btn" type="submit" value="Save"/>
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    );
  }
}