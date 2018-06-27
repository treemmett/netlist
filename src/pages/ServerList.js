import React, { Component } from 'react';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import SearchBar from '../components/SearchBar';
import serialize from '../utils/serializer';
import toast from '../components/Toast';
import parseText from '../utils/parseText';
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
      namingKey: {locations: [], purposes: []},
      searchResult: null
    }
  }
 
  componentDidMount(){
    this.refresh();
  }

  refresh = () => {
    // API call to get all servers
    axios.get('/servers').then(res => this.setState({data: this.sortServers(res.data)})).catch(axiosErrorHandler);

    // Get updated naming key
    const requests = [
      axios.get('/locations'),
      axios.get('/purposes')
    ];

    Promise.all(requests).then(res => this.setState({namingKey: {locations: sort(res[0].data), purposes: sort(res[1].data)}})).catch(axiosErrorHandler);

    function sort(data){
      data.sort(((a, b) => {
        if(a.description.toString().toLowerCase() > b.description.toString().toLowerCase()) return 1;
        if(a.description.toString().toLowerCase() < b.description.toString().toLowerCase()) return -1;
        return 0;
      }));
  
      return data;
    }
  }

  addToData = (newData, removeData) => {
    // Find server
    const data = this.state.data.slice(0);

    // Find and remove data if removeData was received
    if(removeData){
      const index = data.findIndex(obj => obj.serverName === removeData);
      data.splice(index, 1);
    }

    if(newData){
      data.push(newData);
    }
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
        {this.state.modal ? <Modal history={this.props.history} namingKey={this.state.namingKey} allData={this.state.data} data={this.state.openServer} save={this.addToData} close={e => this.setState({modal: false, openServer: {applications: []}})}/> : null}
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

const Row = props => (
  <tr onClick={e => props.openDetails(props.data.serverName)}>
    <td>{props.data.serverName}</td>
    <td>{props.data.applications.length}</td>
    <td>{props.data.patchDate}</td>
    <td>{props.data.updatedBy}</td>
  </tr>
);

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

  componentDidMount(){
    // Check if purposes and locations are set
    const errors = [];
    if(!this.props.namingKey.locations.length){
      errors.push('Please create a location before adding a server');
    }

    if(!this.props.namingKey.purposes.length){
      errors.push('Please create a purpose before adding a server');
    }

    // Redirect to naming key if keys aren't set
    if(errors.length){
      toast(errors);
      this.props.history.push('/namekey');
    }
  }

  addApp = e => {
    // Skip if form is locked
    if(this.state.disabled) return;

    const appInputs = this.state.appInputs.slice(0);
    const curI = this.totalApps;
    this.totalApps++;

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

    const update = Boolean(this.props.data.serverName);

    axios({
      method: update ? 'PUT' : 'POST',
      url: update ? '/servers/'+encodeURIComponent(this.props.data.serverName.toLowerCase()) : '/servers',
      data: data
    }).then(res => {
      // Add new data to table
      this.props.save(res.data, this.props.data.serverName);
  
      // Close modal
      this.props.close();
    }).catch(err => {
      // Unlock form
      this.setState({disabled: false});

      axiosErrorHandler(err);
    });
  }

  delete = () => {
    if(!window.confirm('Are you sure you want to delete '+this.props.data.serverName+'?')){
      return;
    }

    axios.delete('/servers/'+encodeURIComponent(this.props.data.serverName.toLowerCase())).then(() => {
      this.props.save(null, this.props.data.serverName);
      this.props.close();
    }).catch(axiosErrorHandler);
  }

  findNext = () => {
    const input = document.getElementById('serverName');
    // Stop if servername is already filled
    if(input.value.trim()){
      return;
    }

    // Get value of location and purpose
    const location = document.getElementById('location').value.trim();
    const purpose = document.getElementById('purpose').value.trim();

    // Stop if location or purpose aren't filled
    if(!location || !purpose){
      return;
    }

    // Start race to find available index
    const racers = [];
    for(let i = 1; i < 1000; i++){
      racers.push(new Promise(resolve => {
        // Check each item in array for available name
        const index = i.toString().padStart(3, '0')
        const regex = new RegExp(location + purpose + index, 'gi');
        const found = this.props.allData.find(obj => regex.test(obj.serverName));

        if(!found){
          resolve(i);
        }
      }));
    }

    Promise.race(racers).then(index => {
      // Set servername to available index
      index = index.toString().padStart(3, '0');
      input.value = (location + purpose + index).toUpperCase();
    })
  }

  render(){
    // Render all locations
    const locations = [<option key="0" value="" disabled/>];
    for(let i of this.props.namingKey.locations){
      locations.push(<option key={i.code} value={i.code} label={i.description}/>);
    }

    // Render all purposes
    const purposes = [<option key="0" value="" disabled/>];
    for(let i of this.props.namingKey.purposes){
      purposes.push(<option key={i.code} value={i.code} label={i.description}/>);
    }

    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          {this.state.disabled ? <div className="spinner"/> : null}
          <div className="title">{this.props.data.serverName ? this.props.data.serverName : 'New server'}</div>
          <fieldset disabled={this.state.disabled}>
            <form onSubmit={this.save} className="grid">
              <label htmlFor="location">Location</label>
              <select className="select" id="location" name="location" onChange={this.findNext} defaultValue={this.props.data.location || ''} required>{locations}</select>
              
              <label htmlFor="purpose">Purpose</label>
              <select className="select" id="purpose" name="purpose" onChange={this.findNext} defaultValue={this.props.data.purpose || ''} required>{purposes}</select>

              <label htmlFor="serverName">Server Name</label>
              <input onChange={e => parseText(e, {uppercase: true})} type="text" id="serverName" name="serverName" defaultValue={this.props.data.serverName} required/>

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
                <input onClick={this.props.close} className="btn secondary" type="button" value="Cancel"/>
                {this.props.data.serverName ? <input onClick={this.delete} className="btn red" type="button" value="Delete"/> : null}
                <input className="btn" type="submit" value="Save"/>
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    );
  }
}
