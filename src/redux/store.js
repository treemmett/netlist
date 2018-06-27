import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import promise from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import reducers from './reducers';

const middleware = applyMiddleware(promise(), thunk, createLogger());
export default createStore(reducers, middleware);