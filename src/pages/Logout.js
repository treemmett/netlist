import React from 'react';
import { Redirect } from 'react-router-dom';

export default props => {
  // Clear session
  localStorage.removeItem('authToken');
  return <Redirect to="/login"/>
};