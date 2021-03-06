import React from 'react';
import { Redirect } from 'react-router-dom';
import store from '../redux/store';

export default props => {
  // Clear session
  localStorage.clear();
  store.dispatch({type: 'RESET_LOGIN'});
  return <Redirect to="/login"/>
};