const jwt = require('jsonwebtoken');

let defaultState = {}

// Check if token exists from previous session
if(localStorage.authToken){
  // decode token
  const token = jwt.decode(localStorage.authToken);

  if(token){
    // Check if token is still valid
    if(token.exp > Math.floor(Date.now() / 1000)){
      defaultState = {
        loggedIn: true,
        username: token.username,
        admin: token.admin === true,
        expires: token.exp,
        token: localStorage.authToken
      }
    }
  }
}

export default function(state=defaultState, action){
  switch(action.type){
    case 'SET_LOGIN': {
      state = {
        ...state,
        loggedIn: true,
        username: action.payload.username,
        admin: action.payload.admin === true,
        expires: action.payload.exp,
        token: action.payload.token
      }
      break;
    }

    case 'RESET_LOGIN': {
      state = {loggedIn: false}
      break;
    }

    default: break;
  }

  return state;
}