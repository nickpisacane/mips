/**
 * Append Action
 *
 * Appends `data` to console buffer
 */
const CONSOLE_APPEND = 'CONSOLE_APPEND'
type AppendAction = {
  type: 'CONSOLE_APPEND',
  data: string
}
export const append = (data: string): AppendAction => ({
  type: CONSOLE_APPEND,
  data,
})

/**
 * Clear Action
 *
 * Clears the console buffer
 */
const CONSOLE_CLEAR = 'CONSOLE_CLEAR'
type ClearAction = {
  type: 'CONSOLE_CLEAR'
}
export const clear = (): ClearAction => ({
  type: CONSOLE_CLEAR,
})

/**
 * Union Action Type
 */
export type ConsoleAction = AppendAction | ClearAction

/**
 * Console State interface
 * 
 * `data` represents the current console buffer
 */
export interface ConsoleState {
  data: string
}

/**
 * Initial Console state
 */
const initialState: ConsoleState = {
  data: '',
}

/**
 * Console Reducer
 */
export default function consleReducer(
  state: ConsoleState = initialState,
  action: ConsoleAction
): ConsoleState {
  
  switch (action.type) {
    case CONSOLE_APPEND:
      return Object.assign({}, {
        data: state.data + action.data,
      })
    case CONSOLE_CLEAR:
      return initialState
  }

  return state
}