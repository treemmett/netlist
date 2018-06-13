import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = props => (
  <div className="sidebar">
    <Link to="/" className="brand">netlist</Link>
    <NavLink to="/servers" activeClassName="active">Servers</NavLink>
    <NavLink to="/applications" activeClassName="active">Applications</NavLink>
  </div>
);

export default Sidebar;
