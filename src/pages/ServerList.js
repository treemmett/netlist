import React, { Component } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import serialize from '../utils/serializer';
import './ServerList.scss';

// Icons
import PlusCircle from '../svg/PlusCircle';
import MinusCircle from '../svg/MinusCircle';
import Check from '../svg/Check';
import Sad from '../svg/Sad';

export default class ServerList extends Component{
  constructor(props){
    super(props);
    this.state = {
      modal: false,
      openServer: {applications: []},
      data: [],
      searchResult: null
    }
  }
 
  componentDidMount(){
    this.getServers();
  }

  getServers = () => {
    // API call to get all servers
    axios.get('/netlist/api/servers').then(res => {

      // Update data in app
      this.setState({data: this.sortServers(res.data)});
    });
  }

  addToData = (newData, removeData) => {
    // Find server
    const data = this.state.data.slice(0);

    // Find and remove data if removeData was received
    if(removeData){
      const index = data.findIndex(obj => obj.serverName === removeData);
      data.splice(index, 1);
    }

    data.push(newData);
    this.setState({data: this.sortServers(data)});
  }

  sortServers = data => {
    data.sort(((a, b) => {
      try{
        if(a.serverName.toLowerCase() > b.serverName.toLowerCase()) return 1;
        if(a.serverName.toLowerCase() < b.serverName.toLowerCase()) return -1;
      }catch(e){ /* We don't care about catching anything here. Must likely due to missing servername */}
      return 0;
    }));

    return data;
  }

  openDetails = serverName => {
    const server = this.state.data.find(obj => obj.serverName === serverName);
    this.setState({openServer: server, modal: true});
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
    const data = this.state.data.filter(obj => reg.test(obj.serverName));

    this.setState({searchResult: this.sortServers(data)});
  }

  render(){
    const rows = [];

    // Show search result, or all data
    const viewset = this.state.searchResult ? this.state.searchResult : this.state.data;

    while(rows.length < viewset.length){
      rows.push(<Row openDetails={this.openDetails} data={viewset[rows.length]} key={rows.length}/>);
    }

    return (
      <React.Fragment>
        {this.state.modal ? <Modal data={this.state.openServer} save={this.addToData} close={e => this.setState({modal: false, openServer: {applications: []}})}/> : null}
        <div className="serverList page">
          <div className="actions">
            <div className="btn" onClick={e => this.setState({modal: true})}>New Server</div>
            <SearchBar search={this.search}/>
          </div>

          {(this.state.searchResult && !rows.length) ?
            <div className="sadFace">
              <Sad/>
              <span>No servers found</span>
            </div>

            :

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
          }
        </div>
      </React.Fragment>
    );
  }
}

class Row extends Component{
  render(){
    const data = this.props.data;

    return (
      <tr onClick={e => this.props.openDetails(data.serverName)}>
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
      appInputs: [],
      disabled: false
    }

    this.totalApps = 0;

    // Add application inputs
    // We're skipping the first item
    // because this is handled in the render
    for(let i = 1; i < this.props.data.applications.length; i++){
      const curI = this.totalApps;
      this.totalApps++;

      this.state.appInputs.push(<React.Fragment key={curI}>
        <input type="text" id={'applications_'+(curI+1)} name="applications[]" defaultValue={this.props.data.applications[i]}/>
        <div className="icon click" onClick={e => this.removeApp(curI)}><MinusCircle/></div>
      </React.Fragment>);
    }
  }

  addApp = e => {
    // Skip if form is locked
    if(this.state.disabled) return;

    const appInputs = this.state.appInputs.slice(0);
    const curI = this.totalApps;
    this.totalApps++;

    // 
    appInputs.push(<React.Fragment key={curI}>
      <input type="text" id={'applications_'+(curI+1)} name="applications[]"/>
      <div className="icon click" onClick={e => this.removeApp(curI)}><MinusCircle/></div>
    </React.Fragment>);

    this.setState({appInputs: appInputs});
  }

  removeApp = key => {
    // Skip if form is locked
    if(this.state.disabled) return;
    
    const appInputs = this.state.appInputs.slice(0);
    const curInput = appInputs.find(obj => obj.key === key.toString());
    const index = appInputs.indexOf(curInput);
    appInputs.splice(index, 1);
    this.setState({appInputs: appInputs});
  }

  save = e => {
    e.preventDefault();
    
    // Disable form
    this.setState({disabled: true});

    const data = serialize(e.target);

    if(this.props.data.serverName){
      // Send update request if data is present
      axios.put('/netlist/api/servers/' + encodeURIComponent(this.props.data.serverName.toLowerCase()), data).then(res => {
        // Add new data to table
        this.props.save(res.data, this.props.data.serverName);
  
        // Close modal
        this.props.close();
      });
    }else{
      // Create new server otherwise
      axios.post('/netlist/api/servers', data).then(res => {
        // Add new data to table
        this.props.save(res.data);
  
        // Close modal
        this.props.close();
      });
    }
  }

  render(){
    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          {this.state.disabled ? <div className="spinner"/> : null}
          <div className="title">{this.props.data.serverName ? this.props.data.serverName : 'New server'}</div>
          <fieldset disabled={this.state.disabled}>
            <form onSubmit={this.save} className="grid">
              <label htmlFor="serverName">Server Name</label>
              <input type="text" id="serverName" name="serverName" defaultValue={this.props.data.serverName} autoFocus required/>

              <label htmlFor="dnsName">DNS Name</label>
              <input type="text" id="dnsName" name="dnsName" defaultValue={this.props.data.dnsName}/>

              <label htmlFor="site">Site</label>
              <input type="text" id="site" name="site" defaultValue={this.props.data.site}/>

              <label htmlFor="os">OS</label>
              <input type="text" id="os" name="os" defaultValue={this.props.data.os}/>

              <label htmlFor="cpu">CPU</label>
              <input type="text" id="cpu" name="cpu" defaultValue={this.props.data.cpu}/>

              <label htmlFor="memory">Memory</label>
              <input type="text" id="memory" name="memory" defaultValue={this.props.data.memory}/>

              <label htmlFor="disks">Disks</label>
              <input type="text" id="disks" name="disks" defaultValue={this.props.data.disks}/>

              <label htmlFor="vlan">VLAN</label>
              <input type="text" id="vlan" name="vlan" defaultValue={this.props.data.vlan}/>

              <label>Virtualization Type</label>
              <div className="radios">
                <input className="radio" type="radio" name="virtualization" id="virt_1" defaultChecked={this.props.data.virtualization === 'physical'} value="physical"/>
                <label className="radio" htmlFor="virt_1">Physical</label>

                <input className="radio" type="radio" name="virtualization" id="virt_2" defaultChecked={this.props.data.virtualization === 'virtual'} value="virtual"/>
                <label className="radio" htmlFor="virt_2">Virtual</label>

                <input className="radio" type="radio" name="virtualization" id="virt_3" defaultChecked={this.props.data.virtualization === 'cloud'} value="cloud"/>
                <label className="radio" htmlFor="virt_3">Cloud</label>
              </div>

              <label htmlFor="maintWin">Maintenance Window</label>
              <input type="text" id="maintWin" name="maintWin" defaultValue={this.props.data.maintWin}/>

              <label htmlFor="owner">Owner</label>
              <input type="text" id="owner" name="owner" defaultValue={this.props.data.owner}/>

              <label htmlFor="url">Application URL</label>
              <input type="text" id="url" name="url" defaultValue={this.props.data.url}/>

              <label htmlFor="backupDate">Last Backup Date</label>
              <input type="date" id="backupDate" name="backupDate" defaultValue={this.props.data.backupDate}/>

              <label htmlFor="patchDate">Last Patch Date</label>
              <input type="date" id="patchDate" name="patchDate" defaultValue={this.props.data.patchDate}/>

              <label htmlFor="updatedBy">Last Updated By</label>
              <input type="text" id="updatedBy" name="updatedBy" defaultValue={this.props.data.updatedBy}/>

              <label>Server Type</label>
              <div className="radios">
                <input className="radio" type="radio" name="serverType" id="type_1" defaultChecked={this.props.data.serverType === 'appliance'} value="appliance"/>
                <label className="radio" htmlFor="type_1">Appliance</label>

                <input className="radio" type="radio" name="serverType" id="type_2" defaultChecked={this.props.data.serverType === 'server'} value="server"/>
                <label className="radio" htmlFor="type_2">Server</label>
              </div>

              <label htmlFor="monitoring">Monitoring Configured</label>
              <input className="checkbox" type="checkbox" id="monitoring" name="monitoring" defaultChecked={this.props.data.monitoring}/>
              <label className="checkbox icon" htmlFor="monitoring"><Check/></label>

              <label htmlFor="applications">Applications</label>
              <input type="text" id="applications" name="applications[]" defaultValue={this.props.data.applications[0]}/>
              <div className="icon click" onClick={this.addApp}><PlusCircle/></div>
              {this.state.appInputs}

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
