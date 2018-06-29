export default function(state={
  fetching: false,
  data: []
}, action){
  switch(action.type){
    case 'GET_USERS_PENDING': {
      state = {
        ...state,
        fetching: true
      }
      break;
    }

    case 'GET_USERS_FULFILLED': {
      state = {
        ...state,
        data: action.payload.data,
        fetching: false
      }
      break;
    }

    case 'GET_USERS_REJECTED': {
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