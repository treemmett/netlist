import { combineReducers } from 'redux';

// Reducer files
import serverData from './serverData';
import user from './user';

export default combineReducers({
  user: user,
  servers: serverData
});