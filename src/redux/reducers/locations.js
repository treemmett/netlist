export default function(state={
  fetching: false,
  data: []
}, action){
  switch(action.type){
    case 'ADD_LOCATION': {
      state = {...state};
      state.data.push(action.payload);
      break;
    }

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

    case 'REMOVE_LOCATION': {
      state = {...state};
      // Find index of old data
      const index = state.data.findIndex(obj => {
        return obj.code === action.payload;
      });

      // Replace data
      if(index > -1){
        state.data.splice(index, 1);
      }
      break;
    }

    case 'UPDATE_LOCATION': {
      state = {...state};
      // Find index of old data
      const index = state.data.findIndex(obj => {
        return obj.code === action.payload.code;
      });

      // Replace data
      if(index > -1){
        state.data[index] = action.payload;
      }
      break;
    }

    default: break;
  }

  return state;
}