import React, { Component } from 'react';
import axios from 'axios';
import axiosErrorHandler from '../utils/axiosErrorHandler';
import './Console.scss';

export default class extends Component{
  constructor(props){
    super(props);
    this.state = {
      servers: [],
      locations: [],
      purposes: []
    }
  }

  componentDidMount(){
    this.refresh();
  }

  refresh = () => {
    // Make API calls
    axios.get('/servers').then(res => this.setState({servers: res.data})).catch(axiosErrorHandler);
    axios.get('/locations').then(res => this.setState({locations: res.data})).catch(axiosErrorHandler);
    axios.get('/purposes').then(res => this.setState({purposes: res.data})).catch(axiosErrorHandler);
  }

  render(){

    // Run reports on the data

    // Get unique applications
    let applications = [];
    try{
      // Get each application in each server
      const applicationsDirty = this.state.servers.map(obj => obj.applications);
      // Flatten array, removing duplicates
      applications = [...new Set(applicationsDirty.reduce((a,c) => a.concat(c).map(v => v.toLowerCase())))];
    }catch(e){/* Failed because first array is empty and *\
              \* reduce isn't smart. Oh well  ¯\_(ツ)_/¯ */}
    

    return (
      <div className="page console">
        <div className="module">
          <div className="title">Servers</div>
          <div className="content">
            <span className="big">{this.state.servers.length}</span>
          </div>
        </div>

        <div className="module">
          <div className="title">Applications</div>
          <div className="content">
            <span className="big">{applications.length}</span>
          </div>
        </div>

        <div className="module">
          <div className="title">Locations</div>
          <div className="content">
            <span className="big">{this.state.locations.length}</span>
          </div>
        </div>

        <div className="module">
          <div className="title">Purposes</div>
          <div className="content">
            <span className="big">{this.state.purposes.length}</span>
          </div>
        </div>
      </div>
    );
  }
}