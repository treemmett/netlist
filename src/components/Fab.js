import React from 'react';
import './Fab.scss';

const Fab = props => (
  <div className="fab" onClick={props.action}>{props.text}</div>
);

export default Fab
