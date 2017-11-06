/**
 * Update Code Action
 */
const CODE_UPDATE = 'CODE_UPDATE'
type UpdateAction = {
  type: 'CODE_UPDATE'
  code: string
}
export const update = (code: string): UpdateAction => ({
  type: CODE_UPDATE,
  code,
})

/**
 * Code State
 *
 * @TODO: Expand state to represent code errors and whatnot
 */
export type CodeState = {
  code: string
}

/**
 * Code Action
 */
export type CodeAction = UpdateAction | any

/**
 * Initial Code State
 *
 * `code` is the string value of the code
 */
const initialState: CodeState = {
  code: '',
}

/**
 * Code Reducer
 */
export default function codeReducer(
  state: CodeState = initialState,
  action: CodeAction
): CodeState {

  switch (action.type) {
    case CODE_UPDATE:
      return Object.assign({}, state, { code: action.code })
  }

  return state
}