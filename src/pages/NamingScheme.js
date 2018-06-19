import React, { Component } from 'react';
import './NamingScheme.scss';
import SearchBar from '../components/SearchBar';

// Vectors
import PlusCircle from '../svg/PlusCircle';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      locations: [
        {
          code: 'DCA',
          description: 'Pleasant Grove'
        },
        {
          code: 'DCA',
          description: 'Pleasant Grove'
        },
        {
          code: 'DEN',
          description: 'Denver'
        }
      ],

      applications: [
        {
          code: 20,
          description: 'Jumpbox'
        },
        {
          code: 21,
          description: 'Domain Controller'
        }
      ],

      modal: false
    }
  }

  addData = (field, data) => {
    // Duplicate existing state
    const state = this.state[field].slice(0);

    state.push(data);

    this.setState({[field]: this.sort(state)});
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
      locations.push(<Row key={locations.length} code={i.code} description={i.description}/>);
    }

    const applications = [];
    for(let i of this.state.applications){
      applications.push(<Row key={applications.length} code={i.code} description={i.description}/>);
    }

    return (
      <div className="page namingScheme">
        {this.state.modal ? <Modal field={this.state.modal} save={this.addData} close={() => this.setState({modal: false})}/> : null}
        <div className="actions">
          <SearchBar/>
        </div>
        <div className="tables">
          <div className="table">
            <div className="tbl-title">
              <span>Locations</span>
              <div className="icon click" onClick={() => this.setState({modal: 'locations'})}><PlusCircle/></div>
            </div>
            <div className="tbl-header">
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
            <div className="tbl-title">
              <span>Applications</span>
              <div className="icon click" onClick={() => this.setState({modal: 'applications'})}><PlusCircle/></div>  
            </div>
            <div className="tbl-header">
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
                <tbody>{applications}</tbody>
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

    // Lock form
    this.setState({disabled: true});

    // Send data to page
    this.props.save(this.props.field, {code: e.target.elements.code.value.trim(), description: e.target.elements.description.value.trim()});
    this.props.close();
  }

  render(){
    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          <fieldset disabled={this.state.disabled}>
            <form onSubmit={this.save}>
              <label htmlFor="code">Code</label>
              <input id="code" name="code" type="text"/>
              <label htmlFor="description">Description</label>
              <input id="description" name="description" type="text"/>
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