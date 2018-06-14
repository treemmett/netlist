import React, { Component } from 'react';
import axios from 'axios';
import './ServerList.scss';
import PlusCircle from '../svg/PlusCircle';
import MinusCircle from '../svg/MinusCircle';
import Check from '../svg/Check';

export default class ServerList extends Component{
  constructor(props){
    super(props);
    this.state = {
      modal: false,
      data: []
    }
  }

  componentDidMount(){
    this.getServers();
  }

  getServers = () => {
    // API call to get all servers
    axios.get('/netlist/api/servers').then(res => {

      // Sort data by servername
      res.data.sort(((a, b) => {
        if(a.serverName > b.serverName) return 1;
        if(a.serverName < b.serverName) return -1;
        return 0;
      }));

      // Update data in app
      this.setState({data: res.data});
    });
  }

  addToData = newData => {
    const data = this.state.data.slice(0);
    data.push(newData);
    this.setState({data: data});
  }

  render(){
    const rows = [];
    while(rows.length < this.state.data.length){
      rows.push(<Row data={this.state.data[rows.length]} key={rows.length}/>);
    }

    return (
      <React.Fragment>
        {this.state.modal ? <Modal save={this.addToData} close={e => this.setState({modal: false})}/> : null}
        <div className="serverList page">
          <div className="actions">
            <div className="btn" onClick={e => this.setState({modal: true})}>New Server</div>
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
    const data = this.props.data;

    return (
      <tr>
        <td>{data.serverName}</td>
        <td>{data.applications.length}</td>
        <td>{data.patchDate}</td>
        <td>{data.updatedBy}</td>
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

  save = e => {
    e.preventDefault();

    // Compile data from form
    const data = {
      applications: []
    };

    for(let i of e.target){
      // Skip buttons and submit
      if(i.type.match(/button|submit/i)){
        continue;
      }

      // Correct parsing for radios
      if(i.type.match(/radio/i)){
        if(i.checked){
          data[i.name] = i.value;
        }

        continue;
      }

      // Correct parsing for checkbox
      if(i.type.match(/checkbox/i)){
        data[i.id] = i.checked;
        continue;
      }

      // Add applictions to separate array
      if(i.id.match(/^applications_/i)){
        if(!i.value.trim()){
          continue;
        }

        data.applications.push(i.value.trim());
        continue;
      }

      data[i.id] = i.value.trim();
    }

    console.log(data);
    this.props.save(data);
    this.props.close();
  }

  render(){
    return (
      <div className="modal" onClick={this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          <div className="title">New Server</div>
          <form onSubmit={this.save} className="grid">
            <label htmlFor="serverName">Server Name</label>
            <input type="text" id="serverName" autoFocus/>

            <label htmlFor="dnsName">DNS Name</label>
            <input type="text" id="dnsName"/>

            <label htmlFor="site">Site</label>
            <input type="text" id="site"/>

            <label htmlFor="os">OS</label>
            <input type="text" id="os"/>

            <label htmlFor="cpu">CPU</label>
            <input type="text" id="cpu"/>

            <label htmlFor="memory">Memory</label>
            <input type="text" id="memory"/>

            <label htmlFor="disks">Disks</label>
            <input type="text" id="disks"/>

            <label htmlFor="vlan">VLAN</label>
            <input type="text" id="vlan"/>

            <label>Virtualization Type</label>
            <div className="radios">
              <input className="radio" type="radio" name="virtualization" id="virt_1" value="physical"/>
              <label className="radio" htmlFor="virt_1">Physical</label>

              <input className="radio" type="radio" name="virtualization" id="virt_2" value="virtual"/>
              <label className="radio" htmlFor="virt_2">Virtual</label>

              <input className="radio" type="radio" name="virtualization" id="virt_3" value="cloud"/>
              <label className="radio" htmlFor="virt_3">Cloud</label>
            </div>

            <label htmlFor="maintWin">Maintenance Window</label>
            <input type="text" id="maintWin"/>

            <label htmlFor="owner">Owner</label>
            <input type="text" id="owner"/>

            <label htmlFor="url">Application URL</label>
            <input type="text" id="url"/>

            <label htmlFor="backupDate">Last Backup Date</label>
            <input type="date" id="backupDate"/>

            <label htmlFor="patchDate">Last Patch Date</label>
            <input type="date" id="patchDate"/>

            <label htmlFor="updatedBy">Last Updated By</label>
            <input type="text" id="updatedBy"/>

            <label>Server Type</label>
            <div className="radios">
              <input className="radio" type="radio" name="server_type" id="type_1" value="appliance"/>
              <label className="radio" htmlFor="type_1">Appliance</label>

              <input className="radio" type="radio" name="server_type" id="type_2" value="server"/>
              <label className="radio" htmlFor="type_2">Server</label>
            </div>

            <label htmlFor="monitoring">Monitoring Configured</label>
            <input className="checkbox" type="checkbox" id="monitoring"/>
            <label className="checkbox icon" htmlFor="monitoring"><Check/></label>

            <label htmlFor="applications_0">Applications</label>
            <input type="text" id="applications_0"/>
            <div className="icon click" onClick={this.addApp}><PlusCircle/></div>
            {this.state.appInputs}

            <div className="actions">
              <input className="btn" type="submit" value="Save"/>
              <input onClick={this.props.close} className="btn secondary" type="button" value="Cancel"/>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
