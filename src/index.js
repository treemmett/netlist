import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Components
import App from './App';
import Sidebar from './components/Sidebar';

const Render = () => (
  <Router>
    <React.Fragment>
      <Sidebar/>

      <Switch>
        <Route exact path="/" component={App}/>
      </Switch>
      </React.Fragment>
  </Router>
);

ReactDOM.render(<Render/>, document.getElementById('root'));
