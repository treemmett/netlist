import React, { Component } from 'react';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import autosize from 'autosize';
import { connect } from 'react-redux';
import classNames from 'classnames';
import SearchBar from '../components/SearchBar';
import serialize from '../utils/serializer';
import toast from '../components/Toast';
import parseText from '../utils/parseText';
import './ServerList.scss';

// Icons
import Download from '../svg/Download';
import PlusCircle from '../svg/PlusCircle';
import MinusCircle from '../svg/MinusCircle';
import Check from '../svg/Check';
import Sad from '../svg/Sad';
import Sliders from '../svg/Sliders';

@connect(store => {
  return {
    admin: store.login.admin,
    servers: store.servers.data,
    headers: store.servers.keys,
    selectedHeaders: store.settings.headers
  }
})
export default class ServerList extends Component{
  constructor(props){
    super(props);
    this.state = {
      customizeHeadersMenu: false,
      modal: false,
      openServer: {applications: []},
      search: null,
      sortingHeader: 'serverName',
      inverseSort: false 
    }
  }

  openDetails = serverName => {
    const server = this.props.servers.find(obj => obj.serverName === serverName);
    this.setState({openServer: server, modal: true});
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

    // Send search to renderer
    this.setState({search: reg});
  }

  download = e => {
    axios({
      method: 'GET',
      headers: {
        accept: 'text/csv'
      },
      url: '/servers'
    }).then(res => {
      const url = `data:${res.headers['content-type']},${encodeURIComponent(res.data)}`;
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'Servers.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }).catch(axiosErrorHandler)
  }

  changeSortingKey = key => {
    if(key === this.state.sortingHeader){
      // Invert sorting direction if key is already the sorter
      this.setState({inverseSort: !this.state.inverseSort});
    }else{
      // Set new sorting key
      this.setState({sortingHeader: key, inverseSort: false})
    }
  }

  checkSort = key => {
    // Change sorting column to server name if the selected is hidden
    if(key === this.state.sortingHeader){
      this.setState({sortingHeader: 'serverName', inverseSort: false})
    }
  }

  render(){
    // Push "Server" key to front
    const headerKeys = this.props.selectedHeaders.slice(0);
    const index = headerKeys.indexOf('serverName');
    if(index > -1){
      headerKeys.splice(index, 1);
    }
    headerKeys.unshift('serverName');

    // Render headers
    const headers = headerKeys.map((header, i) => <th className={classNames({sort: this.state.sortingHeader === header, inverse: this.state.sortingHeader === header && this.state.inverseSort})} key={i} title={this.props.headers[header]} onClick={() => this.changeSortingKey(header)}>{this.props.headers[header]}</th>);

    const mappedServers = this.props.servers.filter(server => {
      // Apply search filter
      return !this.state.search || this.state.search.test(server.serverName) || this.state.search.test(server.applications);
    }).sort((a, b) => {
      // Sort servers by name first, regardless of actual sorting key. This ensures the name is the backup sort in the event of a sort collision.
      if(a.serverName.toLowerCase() > b.serverName.toLowerCase()) return 1;
      if(a.serverName.toLowerCase() < b.serverName.toLowerCase()) return -1;
      return 0;
    }).sort((a, b) => {
      // Sort by selected header
      const itemA = a[this.state.sortingHeader] ? a[this.state.sortingHeader].toString().toLowerCase() : '';
      const itemB = b[this.state.sortingHeader] ? b[this.state.sortingHeader].toString().toLowerCase() : '';

      if(itemA > itemB) return this.state.inverseSort ? -1 : 1;
      if(itemB > itemA) return this.state.inverseSort ? 1 : -1;
      return 0;
    }).map((server, i) => {
      // Render server
      return <Row headers={headerKeys} openDetails={this.openDetails} data={server} key={i}/>
    });

    return (
      <div className="serverList page" onClick={() => this.setState({customizeHeadersMenu: false})}>
        {this.state.modal ? <Modal history={this.props.history} admin={this.props.admin} data={this.state.openServer} close={e => this.setState({modal: false, openServer: {applications: []}})}/> : null}
        <div className="actions">
          {this.props.admin ? <div className="btn" onClick={e => this.setState({modal: true})}>New Server</div> : null}
          <SearchBar search={this.search}/>
          <div className="spacer"/>
          <div className={classNames('icon', {focus: this.state.customizeHeadersMenu})} onClick={e => {e.stopPropagation(); this.setState({customizeHeadersMenu: !this.state.customizeHeadersMenu})}}><Sliders/>{this.state.customizeHeadersMenu ? <HeaderMenu checkSort={this.checkSort}/> : null}
          </div>
          <div className="icon" onClick={this.download}><Download/></div>
        </div>

        {(this.state.search && !mappedServers.length) ?
          <div className="sadFace">
            <Sad/>
            <span>No servers found</span>
          </div>

          :

          <div className="table">
            <div className="tbl-header">
              <table cellPadding="0" cellSpacing="0" border="0">
                <thead>
                  <tr>{headers}</tr>
                </thead>
              </table>
            </div>
            <div className="tbl-content">
              <table cellPadding="0" cellSpacing="0" border="0">
                <tbody>
                  {mappedServers}
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    );
  }
}

const Row = props => {
  // Render columns
  const col = props.headers.map((header, i) => {
    let response = '';

    switch(typeof props.data[header]){
      case 'string': {
        response = props.data[header];
        break;
      }

      case 'boolean': {
        if(props.data[header]){
          response = '✔';
        }
        break;
      }

      case 'object': {
        if(props.data[header] instanceof Array){
          if(props.data[header].length === 1){
            response = props.data[header][0];
          }else{
            response = props.data[header].length;
          }
        }else{
          response = JSON.stringify(props.data[header]);
        }
        break;
      }

      default: {
        response = props.data[header];
        break;
      }
    }

    return <td title={response} key={i}>{response}</td>
  })

  return (
    <tr className={classNames('hover', {retired: props.data.retired})} onClick={e => props.openDetails(props.data.serverName)}>{col}</tr>
  );
}

@connect(store => {
  return {
    dns: store.settings.dns,
    servers: store.servers.data,
    locations: store.locations.data,
    purposes: store.purposes.data
  }
})
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
    // Resize notes field
    autosize(this.notesField);

    // Check if purposes and locations are set
    const errors = [];
    if(!this.props.locations.length){
      errors.push('Please create a location before adding a server');
    }

    if(!this.props.purposes.length){
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
      // Add new server to store
      this.props.dispatch({
        type: update ? 'UPDATE_SERVER' : 'ADD_SERVER',
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
    if(!window.confirm('Are you sure you want to delete '+this.props.data.serverName+'?')){
      return;
    }

    axios.delete('/servers/'+encodeURIComponent(this.props.data.serverName.toLowerCase())).then(() => {
      // Remove server from store
      this.props.dispatch({
        type: 'REMOVE_SERVER',
        payload: this.props.data.serverName
      });

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
        const found = this.props.servers.find(obj => regex.test(obj.serverName));

        if(!found){
          resolve(i);
        }
      }));
    }

    Promise.race(racers).then(index => {
      // Set servername to available index
      index = index.toString().padStart(3, '0');
      input.value = (location + purpose + index).toUpperCase();
      if(this.props.dns){ 
        document.getElementById('dnsName').value = (location + purpose + index).toLowerCase() + '.' + this.props.dns;
      }
    })
  }

  populateDNS = e => {
    const value = e.target.value.toUpperCase();
    e.target.value = value;

    if(value.trim()){
      if(this.props.dns){
        document.getElementById('dnsName').value = value.toLowerCase()+'.'+this.props.dns;
      }
    }else{
      document.getElementById('dnsName').value = '';
    }
  }

  render(){
    // Render all locations
    const locations = [<option key="0" value="" disabled/>].concat(this.props.locations.map(i => {
      return <option key={i.code} value={i.code} label={i.description}/>
    }));

    // Render all purposes
    const purposes = [<option key="0" value="" disabled/>].concat(this.props.purposes.map(i => {
      return <option key={i.code} value={i.code} label={i.description}/>
    }));

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
              <input onChange={this.populateDNS} type="text" id="serverName" name="serverName" defaultValue={this.props.data.serverName} required/>

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

              <label htmlFor="maintWinFrom">Maintenance Window</label>
              <div className="maintWin">
                <input onChange={e => parseText(e, {type: 'time'})} type="text" id="maintWin" name="maintWin" size="4" defaultValue={this.props.data.maintWin}/>
                <span> - </span>
                <input onChange={e => parseText(e, {type: 'time'})} type="text" id="maintWinTo" name="maintWinTo" size="4" defaultValue={this.props.data.maintWinTo}/>
              </div>

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

              <label htmlFor="monitoring">Retired</label>
              <input className="checkbox" type="checkbox" id="retired" name="retired" defaultChecked={this.props.data.retired}/>
              <label className="checkbox icon" htmlFor="retired"><Check/></label>

              <label htmlFor="applications">Applications</label>
              <input type="text" id="applications" name="applications[]" defaultValue={this.props.data.applications[0]}/>
              <div className="icon click" onClick={this.addApp}><PlusCircle/></div>
              {this.state.appInputs}

              <label htmlFor="notes" className="notesLabel">Notes</label>
              <textarea ref={c => this.notesField = c} name="notes" id="notes" defaultValue={this.props.data.notes}/>

              <div className="actions">
                <input onClick={this.props.close} className="btn secondary" type="button" value={this.props.admin ? 'Cancel' : 'Close'}/>
                {this.props.data.serverName && this.props.admin ? <input onClick={this.delete} className="btn red" type="button" value="Delete"/> : null}
                {this.props.admin ? <input className="btn" type="submit" value="Save"/> : null}
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    );
  }
}

@connect(store => {
  return {
    headers: store.servers.keys,
    selectedHeaders: store.settings.headers
  }
})
class HeaderMenu extends Component{
  update = e => {
    // Check if the selected header is the current sorting header
    this.props.checkSort(e.target.name);

    // Update settings locally before sending request to server
    this.props.dispatch({
      type: 'TOGGLE_HEADER',
      payload: e.target.name
    });

    axios.patch('/settings/headers/'+encodeURIComponent(e.target.name)).catch(axiosErrorHandler);
  }

  render(){
    // Render options
    let headers = Object.keys(this.props.headers).filter(header => header !== 'serverName').map((header, i) => (
      <div key={i} onClick={e => e.stopPropagation()} className="headerItem">
        <input onChange={this.update} checked={this.props.selectedHeaders.indexOf(header) > -1} name={header} id={header} type="checkbox"/>
        <label htmlFor={header}>{this.props.headers[header]}</label>
      </div>
    ));

    return (
      <div className="headerMenu" onClick={e => e.stopPropagation()}>
        {headers}
      </div>
    );
  }
}