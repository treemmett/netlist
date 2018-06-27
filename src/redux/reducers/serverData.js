export default function(state={}, action){
  switch(action.type){
    case 'GET_SERVERS_PENDING': {
      state = {
        ...state,
        fetching: true
      }
      break;
    }

    case 'GET_SERVERS_FULFILLED': {
      state = {
        ...state,
        servers: action.payload.data,
        fetching: false
      }
      break;
    }

    case 'GET_SERVERS_REJECTED': {
      state = {
        ...state,
        fetching: false,
        error: action.payload
      }
      break;
    }

    default: break;
  }

  return state;
}