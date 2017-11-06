import { combineReducers } from 'redux'

import console, { ConsoleState } from './console'
import code, { CodeState } from './code'

export interface State {
  console: ConsoleState
  code: CodeState
}

export default combineReducers<State>({
  console,
  code,
})