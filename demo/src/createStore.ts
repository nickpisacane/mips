import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import rootReducer, { State } from './reducers'

const middlewares = [thunk]

if (process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger')
  middlewares.push(logger)
}

export default function _createStore() {
  return createStore<State>(rootReducer, {} as State, compose(
    applyMiddleware(...middlewares)
  ))
}