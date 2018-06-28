export default function(state={}, action){
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