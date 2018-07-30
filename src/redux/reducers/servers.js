export default function(state={
  fetching: false,
  data: []
}, action){
  switch(action.type){
    case 'ADD_SERVER': {
      state = {...state};
      state.data.push(action.payload);
      break;
    }

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
        data: action.payload.data,
        fetching: false
      }
      break;
    }

    case 'GET_SERVER_KEYS_FULFILLED': {
      state = {
        ...state,
        keys: action.payload.data
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

    case 'REMOVE_SERVER': {
      state = {...state};
      // Find index of old data
      const index = state.data.findIndex(server => {
        return server.serverName.toLowerCase() === action.payload.toLowerCase();
      });

      // Replace data
      if(index > -1){
        state.data.splice(index, 1);
      }
      break;
    }

    case 'UPDATE_SERVER': {
      state = {...state};
      // Find index of old data
      const index = state.data.findIndex(server => {
        return server.serverName.toLowerCase() === action.payload.serverName.toLowerCase();
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