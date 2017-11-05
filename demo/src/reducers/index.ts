import { combineReducers } from 'redux'

import console, { ConsoleState } from './console'

export interface State {
  console: ConsoleState
}

export default combineReducers<State>({
  console,
})