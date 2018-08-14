export default function(state={
  fetching: false,
  data: []
}, action){
  switch(action.type){
    case 'ADD_PURPOSE': {
      state = {...state};
      state.data.push(action.payload);
      break;
    }

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
    
    case 'REMOVE_PURPOSE': {
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

    case 'UPDATE_PURPOSE': {
      state = {...state};
      // Find index of old data
      const index = state.data.findIndex(obj => obj.id === action.payload.id);

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