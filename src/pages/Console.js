import React from 'react';
import { connect } from 'react-redux';
import './Console.scss';

const Console = props => {
  // Run reports on the data
  // Get unique applications
  let applications = [];
  try{
    // Get each application in each server
    const applicationsDirty = props.servers.map(obj => obj.applications);
    // Flatten array, removing duplicates
    applications = [...new Set(applicationsDirty.reduce((a,c) => a.concat(c).map(v => v.toLowerCase())))];
  }catch(e){/* Failed because first array is empty and *\
            \* reduce isn't smart. Oh well  ¯\_(ツ)_/¯ */}

  return (
    <div className="page console">
      <div className="module">
        <div className="title">Servers</div>
        <div className="content">
          <span className="big">{props.servers.length}</span>
        </div>
      </div>

      <div className="module">
        <div className="title">Users</div>
        <div className="content">
          <span className="big">{props.users.length}</span>
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
          <span className="big">{props.locations.length}</span>
        </div>
      </div>

      <div className="module">
        <div className="title">Purposes</div>
        <div className="content">
          <span className="big">{props.purposes.length}</span>
        </div>
      </div>
    </div>
  );
}

export default connect(store => {
  return {
    locations: store.locations.data,
    purposes: store.purposes.data,
    servers: store.servers.data,
    users: store.users.data
  }
})(Console);