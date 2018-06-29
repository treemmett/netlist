export default function(state={
  fetching: false,
  data: []
}, action){
  switch(action.type){
    case 'ADD_USER': {
      state = {...state};
      state.data.push(action.payload);
      break;
    }

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

    case 'REMOVE_USER': {
      state = {...state};
      // Find index of old data
      const index = state.data.findIndex(user => {
        return user.username.toLowerCase() === action.payload.toLowerCase();
      });

      // Replace data
      if(index > -1){
        state.data.splice(index, 1);
      }
      break;
    }

    case 'UPDATE_USER': {
      state = {...state};
      // Find index of old data
      const index = state.data.findIndex(user => {
        return user.username.toLowerCase() === action.payload.username.toLowerCase();
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