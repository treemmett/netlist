import store from '../redux/store';
import axios from 'axios';
let isLoggedIn = false;

// Function to check if we're now logged in
function checkIfLoggedIn(){
  const wasLoggedIn = isLoggedIn;
  isLoggedIn = store.getState().login.loggedIn;

  // Force data fetch if this is a new login
  if(isLoggedIn && wasLoggedIn !== isLoggedIn){

    // Fetch settings
    store.dispatch({
      type: 'GET_SETTINGS',
      payload: axios.get('/settings')
    });
    
    // Fetch servers
    store.dispatch({
      type: 'GET_SERVERS',
      payload: axios.get('/servers')
    });

    // Fetch users
    store.dispatch({
      type: 'GET_USERS',
      payload: axios.get('/users')
    });

    // Fetch locations
    store.dispatch({
      type: 'GET_LOCATIONS',
      payload: axios.get('/locations')
    });

    // Fetch purposes
    store.dispatch({
      type: 'GET_PURPOSES',
      payload: axios.get('/purposes')
    });
  }
}

export default function(){
  checkIfLoggedIn();
  store.subscribe(checkIfLoggedIn);
}