import React, { Component } from 'react';
import './ServerList.scss';

export default class ServerList extends Component{
  render(){
    const rows = [];
    while(rows.length < 20){
      rows.push(<Row key={rows.length}/>);
    }

    return (
      <div className="serverList page">
        <div className="table">
          <div className="tbl-header">
            <table cellPadding="0" cellSpacing="0" border="0">
              <thead>
                <tr>
                  <th>Server</th>
                  <th>Applications</th>
                  <th>Last Updated</th>
                  <th>Last Updater</th>
                  <th>Status</th>
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
      </div>
    );
  }
}

class Row extends Component{
  render(){
    return (
      <tr>
        <td>DCA21001</td>
        <td>3</td>
        <td>Jun 1, 2018</td>
        <td>John Doe</td>
        <td>Online</td>
      </tr>
    );
  }
}
