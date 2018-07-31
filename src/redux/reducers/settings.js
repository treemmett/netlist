export default function(state={
  headers: []
}, action){
  switch(action.type){
    case 'GET_SETTINGS_FULFILLED': {
      state = action.payload.data;
      break;
    }

    case 'TOGGLE_HEADER': {
      // Check if header already exists in array
      if(state.headers.indexOf(action.payload) > -1){
        state = {
          ...state,
          headers: state.headers.filter(item => item !== action.payload)
        }
      }else{
        state = {
          ...state,
          headers: [...state.headers, action.payload]
        }
      }

      break;
    }

    case 'SET_SETTINGS': {
      state = action.payload;
      break;
    }

    default: break;
  }

  return state;
}