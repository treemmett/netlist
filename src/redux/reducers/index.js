import { combineReducers } from 'redux';

// Reducer files
import locations from './locations';
import login from './login';
import purposes from './purposes';
import servers from './servers';
import users from './users';

export default combineReducers({
  locations: locations,
  login: login,
  purposes: purposes,
  servers: servers,
  users: users
});