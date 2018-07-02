import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import promise from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import reducers from './reducers';

const middlewares = [promise(), thunk];

// Apply redux logger if we're in dev environment
if(process.env.NODE_ENV === 'development'){
  middlewares.push(createLogger());
}

const middleware = applyMiddleware(...middlewares);
export default createStore(reducers, middleware);