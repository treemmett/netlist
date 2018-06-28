import { combineReducers } from 'redux';

// Reducer files
import serverData from './serverData';
import login from './login';

export default combineReducers({
  login: login,
  servers: serverData
});