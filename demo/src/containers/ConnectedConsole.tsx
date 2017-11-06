import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { State } from '../reducers'
import { ConsoleState, clear } from '../reducers/console'
import Console, { Props } from '../components/Console'

const mapStateToProps = (state: State): Partial<Props> => ({
  data: state.console.data,
})

const mapDispatchToProps = (dispatch: Dispatch<State>): Partial<Props> =>
  bindActionCreators({
    onClear: clear,
  }, dispatch)

export default connect<
  Partial<Props>,
  Partial<Props>,
  {
    onData: (data: string) => void
  }
>(mapStateToProps, mapDispatchToProps, null, { withRef: true })(Console)