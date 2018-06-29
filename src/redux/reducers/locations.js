export default function(state={
  fetching: false,
  data: []
}, action){
  switch(action.type){
    case 'GET_LOCATIONS_PENDING': {
      state = {
        ...state,
        fetching: true
      }
      break;
    }

    case 'GET_LOCATIONS_FULFILLED': {
      state = {
        ...state,
        data: action.payload.data,
        fetching: false
      }
      break;
    }

    case 'GET_LOCATIONS_REJECTED': {
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