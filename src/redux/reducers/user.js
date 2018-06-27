export default function(state={}, action){
  switch(action.type){
    case 'SET_ADMIN': {
      state = {...state, admin: action.payload === true}
      break;
    }

    default: break;
  }

  return state;
}