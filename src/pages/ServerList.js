import React, { Component } from 'react';
import './ServerList.scss';
import PlusCircle from '../svg/PlusCircle';
import MinusCircle from '../svg/MinusCircle';

export default class ServerList extends Component{
  constructor(props){
    super(props);
    this.state = {
      modal: true
    }
  }

  render(){
    const rows = [];
    while(rows.length < 20){
      rows.push(<Row key={rows.length}/>);
    }

    return (
      <React.Fragment>
        {this.state.modal ? <Modal/> : null}
        <div className="serverList page">
          <div className="actions">
            <div className="btn">New Server</div>
          </div>
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
      </React.Fragment>
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

class Modal extends Component{
  constructor(props){
    super(props);
    this.state = {
      appInputs: []
    }

    this.totalApps = 0;
  }

  addApp = e => {
    const appInputs = this.state.appInputs.slice(0);
    const curI = this.totalApps;
    this.totalApps++;

    appInputs.push(<React.Fragment key={curI}>
      <input type="text" id={'applications_'+(curI+1)} name={'applications_'+(curI+1)}/>
      <div className="icon click" onClick={e => this.removeApp(curI)}><MinusCircle/></div>
    </React.Fragment>);

    this.setState({appInputs: appInputs});
  }

  removeApp = key => {
    const appInputs = this.state.appInputs.slice(0);
    const curInput = appInputs.find(obj => obj.key === key.toString());
    const index = appInputs.indexOf(curInput);
    appInputs.splice(index, 1);
    this.setState({appInputs: appInputs});
  }

  render(){
    return (
      <div className="modal">
        <div className="modalCard">
          <div className="title">New Server</div>
          <form className="grid">
            <label htmlFor="server_name">Server Name</label>
            <input type="text" id="server_name" name="server_name"/>

            <label htmlFor="dns_name">DNS Name</label>
            <input type="text" id="dns_name" name="dns_name"/>

            <label htmlFor="site">Site</label>
            <input type="text" id="site" name="site"/>

            <label htmlFor="os">OS</label>
            <input type="text" id="os" name="os"/>

            <label htmlFor="cpu">CPU</label>
            <input type="text" id="cpu" name="cpu"/>

            <label htmlFor="memory">Memory</label>
            <input type="text" id="memory" name="memory"/>

            <label htmlFor="disks">Disks</label>
            <input type="text" id="disks" name="disks"/>

            <label htmlFor="vlan">VLAN</label>
            <input type="text" id="vlan" name="vlan"/>

            <label htmlFor="maint_win">Maintenance Window</label>
            <input type="text" id="maint_win" name="maint_win"/>

            <label htmlFor="owner">Owner</label>
            <input type="text" id="owner" name="owner"/>

            <label htmlFor="url">Application URL</label>
            <input type="text" id="url" name="url"/>

            <label htmlFor="backup_date">Last Backup Date</label>
            <input type="date" id="backup_date" name="backup_date"/>

            <label htmlFor="patch_date">Last Patch Date</label>
            <input type="date" id="patch_date" name="patch_date"/>

            <label htmlFor="updated_by">Last Updated By</label>
            <input type="text" id="updated_by" name="updated_by"/>

            <label htmlFor="monitoring">Monitoring Configured</label>
            <input type="text" id="monitoring" name="monitoring"/>

            <label htmlFor="applications_0">Applications</label>
            <input type="text" id="applications_0" name="applications_0"/>
            <div className="icon click" onClick={this.addApp}><PlusCircle/></div>
            {this.state.appInputs}

            <div className="actions">
              <input className="btn" type="submit" value="Save"/>
              <input className="btn secondary" type="button" value="Cancel"/>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
