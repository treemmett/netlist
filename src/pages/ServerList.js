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
import Refresh from '../svg/Refresh';
import Sad from '../svg/Sad';
import Sliders from '../svg/Sliders';

@connect(store => {
  return {
    admin: store.login.admin,
    servers: store.servers.data,
    serversDownloading: store.servers.fetching,
    headers: store.servers.keys,
    selectedHeaders: store.settings.headers,
    locations: store.locations.data,
    purposes: store.purposes.data
  }
})
export default class ServerList extends Component{
  constructor(props){
    super(props);
    this.state = {
      customizeHeadersMenu: false,
      modal: false,
      openServer: {},
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

  refreshDate = () => {
    this.props.dispatch({
      type: 'GET_SERVERS',
      payload: axios.get('/servers')
    });
  }

  render(){
    // Push "Server" key to front, filter any invalid header
    const headerKeys = this.props.selectedHeaders.slice(0).filter(header => this.props.headers[header]);
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
      return <Row headers={headerKeys} location={this.props.locations} purpose={this.props.purposes} openDetails={this.openDetails} data={server} key={i}/>
    });

    return (
      <div className="serverList page" onClick={() => this.setState({customizeHeadersMenu: false})}>
        {this.state.modal ? <Modal history={this.props.history} admin={this.props.admin} data={this.state.openServer} close={e => this.setState({modal: false, openServer: {}})}/> : null}
        <div className="actions">
          {this.props.admin ? <div className="btn" onClick={e => this.setState({modal: true})}>New Server</div> : null}
          <SearchBar search={this.search}/>
          <div className="spacer"/>
          <div className="icon" onClick={this.refreshDate}><Refresh className={classNames({spin: this.props.serversDownloading})}/></div>
          <div className={classNames('icon', {focus: this.state.customizeHeadersMenu})} onClick={e => {e.stopPropagation(); this.setState({customizeHeadersMenu: !this.state.customizeHeadersMenu})}}><Sliders/>{this.state.customizeHeadersMenu ? <HeaderMenu checkSort={this.checkSort}/> : null}</div>
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
    let title = '';

    switch(typeof props.data[header]){
      case 'string': {
        if(/\$value$/.test(props.data[header])){
          break;
        }

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
          response = props.data[header].length;

          if(props.data[header][0]){
            response += ': '+props.data[header][0];
          }

          title = props.data[header].join(',\n');
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

    if(/\$value$/.test(header)){
      const match = header.match(/(.+)\$value$/)[1]

      const found = props[match].find(obj => obj.code === props.data[match]);

      if(found){
        response = found.description;
      }
    }

    return <td title={title || response} key={i}>{response}</td>
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

    // Create unique ID's for every dynamic field element
    const applications = this.props.data.applications ? this.props.data.applications.map(el => { return {id: performance.now() * Math.random(), value: el}}) : [];
    const serverSmes = this.props.data.serverSmes ? this.props.data.serverSmes.map(el => { return {id: performance.now() * Math.random(), value: el}}) : [];

    this.state = {
      applications: applications.length ? applications : [{id: performance.now(), value: ''}],
      serverSmes: serverSmes.length ? serverSmes : [{id: performance.now(), value: ''}],
      disabled: false
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

  save = e => {
    e.preventDefault();
    
    // Disable form
    this.setState({disabled: true});
    const data = serialize(e.target);
    const update = Boolean(this.props.data.serverName);

    axios({
      method: update ? 'PUT' : 'POST',
      url: update ? '/servers/'+encodeURIComponent(this.props.data.id) : '/servers',
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

  addDynamicField = field => {
    const fields = [...this.state[field]];

    fields.push({id: performance.now(), value: ''});

    this.setState({[field]: fields});
  }

  removeDynamicField = (field, id) => {
    const fields = [...this.state[field]];

    const index = fields.findIndex(obj => obj.id === id);

    fields.splice(index, 1);

    this.setState({[field]: fields});
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
    const locations = [<option key="0" value="" disabled/>].concat(this.props.locations.sort((a, b) => {
      if(a.code > b.code) return 1;
      if(a.code < b.code) return -1;
      return 0;
    }).map(i => {
      return <option key={i.code} value={i.code}>{i.code + ' - ' + i.description}</option>
    }));

    // Render all purposes
    const purposes = [<option key="0" value="" disabled/>].concat(this.props.purposes.sort((a, b) => {
      if(a.code > b.code) return 1;
      if(a.code < b.code) return -1;
      return 0;
    }).map(i => {
      return <option key={i.code} value={i.code}>{i.code + ' - ' + i.description}</option>
    }));

    // Render dynamic fields
    const applications = this.state.applications.map((obj, i) => (
      <React.Fragment key={obj.id}>
        <input type="text" name="applications[]" id={obj.id} defaultValue={obj.value}/>
        <div className="icon click" onClick={i > 0 ? () => this.removeDynamicField('applications', obj.id) : () => this.addDynamicField('applications')}>
          {i > 0 ? <MinusCircle/> : <PlusCircle/>}
        </div>
      </React.Fragment>
    ));

    const serverSmes = this.state.serverSmes.map((obj, i) => (
      <React.Fragment key={obj.id}>
        <input type="text" name="serverSmes[]" id={obj.id} defaultValue={obj.value}/>
        <div className="icon click" onClick={i > 0 ? () => this.removeDynamicField('serverSmes', obj.id) : () => this.addDynamicField('serverSmes')}>
          {i > 0 ? <MinusCircle/> : <PlusCircle/>}
        </div>
      </React.Fragment>
    ));

    return (
      <div className="modal" onClick={this.state.disabled ? null : this.props.close}>
        <div className="modalCard" onClick={e => e.stopPropagation()}>
          {this.state.disabled ? <div className="spinner"/> : null}
          <div className="title">{this.props.data.serverName ? this.props.data.serverName : 'New server'}</div>
          <fieldset disabled={this.state.disabled}>
            <form onSubmit={this.save} className="grid">
              <label htmlFor="serverName">Server Name</label>
              <input onChange={this.populateDNS} type="text" id="serverName" name="serverName" defaultValue={this.props.data.serverName} required/>

              <label htmlFor="location">Location</label>
              <select className="select" id="location" name="location" onChange={this.findNext} defaultValue={this.props.data.location || ''}>{locations}</select>
              
              <label htmlFor="purpose">Purpose</label>
              <select className="select" id="purpose" name="purpose" onChange={this.findNext} defaultValue={this.props.data.purpose || ''}>{purposes}</select>

              <label htmlFor="dnsName">DNS Name</label>
              <input type="text" id="dnsName" name="dnsName" defaultValue={this.props.data.dnsName}/>

              <label htmlFor={this.state.serverSmes[0].id}>SME's</label>
              {serverSmes}

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

              <label htmlFor="retired">Retired</label>
              <input className="checkbox" type="checkbox" id="retired" name="retired" defaultChecked={this.props.data.retired}/>
              <label className="checkbox icon" htmlFor="retired"><Check/></label>

              <label htmlFor="applicationOwner">Application Owner</label>
              <input type="text" id="applicationOwner" name="applicationOwner" defaultValue={this.props.data.applicationOwner}/>

              <label htmlFor={this.state.applications[0].id}>Applications</label>
              {applications}

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