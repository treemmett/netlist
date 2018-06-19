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
          prefix: 'DCA',
          location: 'Pleasant Grove'
        },
        {
          prefix: 'DEN',
          location: 'Denver'
        }
      ],

      applications: [
        {
          code: 20,
          purpose: 'Jumpbox'
        },
        {
          code: 21,
          purpose: 'Domain Controller'
        }
      ]
    }
  }

  render(){
    const locations = [];
    for(let i of this.state.locations){
      locations.push(<Row key={locations.length} code={i.prefix} value={i.location}/>);
    }

    const applications = [];
    for(let i of this.state.applications){
      applications.push(<Row key={applications.length} code={i.code} value={i.purpose}/>);
    }

    return (
      <div className="page namingScheme">
        <div className="actions">
          <SearchBar/>
        </div>
        <div className="tables">
          <div className="table">
            <div className="tbl-title">
              <span>Locations</span>
              <div className="icon click"><PlusCircle/></div>
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
              <div className="icon click"><PlusCircle/></div>  
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
    <td>{props.value}</td>
  </tr>
);