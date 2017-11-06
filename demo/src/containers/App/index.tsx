import * as React from 'react'
import * as SplitPane from 'react-split-pane'
import styled from 'styled-components'
import { bindActionCreators } from 'redux'
import { connect, Dispatch } from 'react-redux'

import MIPS from '../../../../src'
import { State } from '../../reducers'
import * as consoleReducer from '../../reducers/console'
import * as codeReducer from '../../reducers/code'
import IOAdapter from '../../lib/IOAdapter'
import codeSamples from '../../lib/codeSamples'
import Controls from '../../components/Controls'
import Console from '../../components/Console'
import ConnectedConsole from '../ConnectedConsole'
import ConnectedEditor from '../ConnectedEditor'

const DEFUALT_CODE_SAMPLE = 'Hello World'

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const PaneContainer = styled.div`
  position: relative;
  flex: 1;
`

interface Props {
  code: string
  appendConsole: (data: string) => void
  clearConsole: () => void
  updateCode: (code: string) => void
}

interface AppState {
  selectedCodeSample: string
  assembledForCode: string
  canExecute: boolean
}

class App extends React.Component<Props> {
  state: AppState = {
    selectedCodeSample: DEFUALT_CODE_SAMPLE,
    assembledForCode: '',
    canExecute: false,
  }

  private _console: Console
  private ioAdapter: IOAdapter = new IOAdapter()
  private mips: MIPS

  private handleConsoleOnData = (data: string) => {
    this.ioAdapter.stdin.write(data)
  }

  private handleIO = (data: string) => {
    this.props.appendConsole(data)
  }

  private handleCodeSampleChange = (sample: string) => {
    if (this.state.selectedCodeSample !== sample) {
      const code = codeSamples[sample]
      this.props.updateCode(code)
      this.setState({ selectedCodeSample: sample })
    }
  }

  private handleRequestAssemble = () => {
    // TODO: Handle Assemble Errors
    this.mips.updateSource(this.props.code)
    console.log('assembling...')
    try {
      this.mips.assemble()
      this.setState({ canExecute: true, assembledForCode: this.props.code })
    } catch (err) {
      window.alert('Assembler Error: ' + err.message)
    }
  }

  private handleRequestExecute = async () => {
    // TODO: Better Error handliing, Focus on console
    console.log('executing...')
    this.props.clearConsole()
    try {
      if (this._console) this._console.focus()
      await this.mips.execute()
      this.setState({ canExecute: false, assembledForCode: '' })
    } catch (err) {
      alert('Runtime Error: ' + err.message)
    }
  }

  private _consoleRef = (node: any | null) => {
    if (node) {
      this._console = node.getWrappedInstance()
    }
  }

  componentWillMount() {
    this.ioAdapter.on('data', this.handleIO)
    this.mips = new MIPS({
      source: '',
      stdin: this.ioAdapter.stdin,
      stdout: this.ioAdapter.stdout,
      stderr: this.ioAdapter.stderr,
    })
  }

  componentDidMount() {
    this.props.updateCode(codeSamples[this.state.selectedCodeSample])
  }

  componentWillUnmount() {
    this.ioAdapter.destroy()
  }

  render() {
    const {
      code,
    } = this.props
    const {
      selectedCodeSample,
      assembledForCode,
      canExecute,
    } = this.state

    const canAssemble = !!code && code !== assembledForCode

    return (
      <Container>
        <Controls
          selectedCodeSample={selectedCodeSample}
          codeSamples={Object.keys(codeSamples)}
          onCodeSampleChange={this.handleCodeSampleChange}
          onRequestAssemble={this.handleRequestAssemble}
          onRequestExecute={this.handleRequestExecute}
          assembleEnabled={canAssemble}
          executeEnabled={canExecute}
        />
        <PaneContainer>
          <SplitPane split='horizontal' defaultSize={'50%'}>
            <ConnectedEditor />
            <ConnectedConsole
              onData={this.handleConsoleOnData}
              ref={this._consoleRef}
            />
          </SplitPane>
        </PaneContainer>
      </Container>
    )
  }
}

const mapStateToProps = (state: State): Partial<Props> => ({
  code: state.code.code,
})

const mapDispatchToProps = (dispatch: Dispatch<State>): Partial<Props> => bindActionCreators({
  appendConsole: consoleReducer.append,
  clearConsole: consoleReducer.clear,
  updateCode: codeReducer.update,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(App)