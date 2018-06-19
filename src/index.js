import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';

// Global styles
import './index.scss';
import './components/Components.scss';

// Components
import NamingScheme from './pages/NamingScheme';
import ServerList from './pages/ServerList';
import Sidebar from './components/Sidebar';

const Render = () => (
  <Router>
    <React.Fragment>
      <Sidebar/>

      <Switch>
        <Route exact path="/servers" component={ServerList}/>

        <Route exact path="/namescheme" component={NamingScheme}/>
      </Switch>
    </React.Fragment>
  </Router>
);

ReactDOM.render(<Render/>, document.getElementById('root'));
