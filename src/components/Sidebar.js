import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = props => (
  <div className="sidebar">
    <Link to="/" className="brand">netlist</Link>
    <NavLink to="/servers"><div className="border"/>Servers</NavLink>
    <NavLink to="/namekey"><div className="border"/>Name Key</NavLink>
  </div>
);

export default Sidebar;
