export default function(state={
  fetching: false,
  settings: {}
}, action){
  switch(action.type){
    case 'GET_SETTINGS_PENDING': {
      state = {
        ...state,
        fetching: true
      }
      break;
    }

    case 'GET_SETTINGS_FULFILLED': {
      state = {
        ...state,
        settings: action.payload.data,
        fetching: false
      }
      break;
    }

    case 'GET_SETTINGS_REJECTED': {
      state = {
        ...state,
        fetching: false,
        error: action.payload
      }
      break;
    }

    case 'SET_SETTINGS': {
      state = {...state, settings: action.payload}
      break;
    }

    default: break;
  }

  return state;
}