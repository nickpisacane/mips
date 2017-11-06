import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { State } from '../reducers'
import { CodeState, update } from '../reducers/code'
import Editor, { Props } from '../components/Editor'

const mapStateToProps = (state: State): Partial<Props> => ({
  code: state.code.code,
})

const mapDispatchToProps = (dispatch: Dispatch<State>): Partial<Props> =>
  bindActionCreators({
    onUpdateCode: update,
  }, dispatch)

export default connect<
  Partial<Props>,
  Partial<Props>
>(mapStateToProps, mapDispatchToProps)(Editor)