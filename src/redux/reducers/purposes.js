export default function(state={}, action){
  switch(action.type){
    case 'GET_PURPOSES_PENDING': {
      state = {
        ...state,
        fetching: true
      }
      break;
    }

    case 'GET_PURPOSES_FULFILLED': {
      state = {
        ...state,
        data: action.payload.data,
        fetching: false
      }
      break;
    }

    case 'GET_PURPOSES_REJECTED': {
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