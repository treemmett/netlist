import React, { Component } from 'react';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import serialize from '../utils/serializer';
import './NameKey.scss';

// Vectors
import PlusCircle from '../svg/PlusCircle';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      locations: [],
      purposes: [],
      openData: [],
      modal: false
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

    state.push(data);

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

  render(){
    const locations = [];
    for(let i of this.state.locations){
      locations.push(<Row onClick={() => this.open('locations', i)} key={locations.length} code={i.code} description={i.description}/>);
    }

    const purposes = [];
    for(let i of this.state.purposes){
      purposes.push(<Row onClick={() => this.open('purposes', i)} key={purposes.length} code={i.code} description={i.description}/>);
    }

    return (
      <div className="page namingScheme">
        {this.state.modal ? <Modal field={this.state.modal} data={this.state.openData} save={this.addData} close={() => this.setState({modal: false, openData: {}})}/> : null}
        <div className="actions">
          <SearchBar/>
        </div>
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

  render(){
    // Unique settings for fieldsets
    const config = this.props.field === 'locations' ? {
      length: 3,
      description: 'Location',
      code: 'Prefix'
    } : {
      length: 2,
      description: 'Purpose',
      code: 'Code'
    }

    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          <fieldset disabled={this.state.disabled}>
            <form className="grid" onSubmit={this.save}>
              <label htmlFor="code">{config.code}</label>
              <input defaultValue={this.props.data.code} disabled={this.props.data.code} minLength={config.length} maxLength={config.length} id="code" name="code" type="text" required/>
              <label htmlFor="description">{config.description}</label>
              <input defaultValue={this.props.data.description} id="description" name="description" type="text" required/>
              <div className="actions">
                <input className="btn" type="submit" value="Save"/>
                <input onClick={this.props.close} className="btn secondary" type="button" value="Cancel"/>
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    );
  }
}