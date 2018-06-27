import React, { Component } from 'react';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import serialize from '../utils/serializer';
import parseText from '../utils/parseText';
import './NameKey.scss';

// Vectors
import PlusCircle from '../svg/PlusCircle';
import Sad from '../svg/Sad';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      locations: [],
      purposes: [],
      openData: [],
      modal: false,
      searchResultL: null,
      searchResultP: null
    }
  }

  componentDidMount(){
    this.refresh();
  }

  refresh = () => {
    // API call for locations
    axios.get('/locations').then(res => this.setState({locations: this.sort(res.data)})).catch(axiosErrorHandler);

    // API call for purposes
    axios.get('/purposes').then(res => this.setState({purposes: this.sort(res.data)})).catch(axiosErrorHandler);
  }

  addData = (field, data, updatedField) => {

    // Duplicate existing state
    const state = this.state[field].slice(0);

    // Find and remove data if updatedField was received
    if(updatedField){
      const index = state.findIndex(obj => obj.code === updatedField);
      state.splice(index, 1);
    }

    if(data){
      state.push(data);
    }

    this.setState({[field]: this.sort(state)});
  }

  open = (field, data) => {
    this.setState({modal: field, openData: data});
  }

  sort = data => {
    data.sort(((a, b) => {
      if(a.code.toString().toLowerCase() > b.code.toString().toLowerCase()) return 1;
      if(a.code.toString().toLowerCase() < b.code.toString().toLowerCase()) return -1;
      return 0;
    }));

    return data;
  }

  search = e => {
    // Remove search result if value is empty
    if(!e.target.value){
      this.setState({searchResultL: null, searchResultP: null});
      return;
    }

    // Escape regex sensitive characters
    const chars = e.target.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // Create regex from search value
    const reg = new RegExp(chars, 'i');

    // Find data that matches search result
    const locations = this.state.locations.filter(obj => reg.test(obj.code) || reg.test(obj.description));
    const purposes = this.state.purposes.filter(obj => reg.test(obj.code) || reg.test(obj.description));

    this.setState({searchResultL: locations, searchResultP: purposes});
  }

  render(){
    const isSearching = Boolean(this.state.searchResultL || this.state.searchResultP);
    
    const locations = [];
    for(let i of isSearching ? this.state.searchResultL : this.state.locations){
      locations.push(<Row onClick={() => this.open('locations', i)} key={locations.length} code={i.code} description={i.description}/>);
    }

    const purposes = [];
    for(let i of isSearching ? this.state.searchResultP : this.state.purposes){
      purposes.push(<Row onClick={() => this.open('purposes', i)} key={purposes.length} code={i.code} description={i.description}/>);
    }

    return (
      <div className="page namingScheme">
        {this.state.modal ? <Modal field={this.state.modal} data={this.state.openData} save={this.addData} close={() => this.setState({modal: false, openData: {}})}/> : null}
        <div className="actions">
          <SearchBar search={this.search}/>
        </div>

        {(this.state.searchResultL && !locations.length && !purposes.length) ?
          <div className="sadFace">
            <Sad/>
            <span>No results found</span>
          </div>

          :

          <div className="tables">
            <div className="table">
              <div className="tbl-header">
                <div className="icon click" onClick={() => this.setState({modal: 'locations'})}><PlusCircle/></div>
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
                  <tbody>{locations}</tbody>
                </table>
              </div>
            </div>

            <div className="table">
              <div className="tbl-header">
                <div className="icon click" onClick={() => this.setState({modal: 'purposes'})}><PlusCircle/></div>  
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
                  <tbody>{purposes}</tbody>
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
  <tr {...props}>
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
      url: update ? '/'+this.props.field+'/'+encodeURIComponent(this.props.data.code.toString().toLowerCase()) : '/'+this.props.field,
      data: data
    }).then(res => {
      // Send data to page, remove old field
      this.props.save(this.props.field, res.data, this.props.data.code);

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
      this.props.save(this.props.field, null, this.props.data.code);
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
              <input onChange={config.formatter} defaultValue={this.props.data.code} disabled={this.props.data.code} id="code" name="code" type="text" autoFocus required/>
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