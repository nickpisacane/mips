import * as React from 'react'
import * as SplitPane from 'react-split-pane'
import styled from 'styled-components'
import { bindActionCreators } from 'redux'
import { connect, Dispatch } from 'react-redux'

import { State } from '../../reducers'
import { append } from '../../reducers/console'
import IOAdapter from '../../lib/IOAdapter'
import ConnectedConsole from '../ConnectedConsole'
import ConnectedEditor from '../ConnectedEditor'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

interface Props {
  appendConsole: (data: string) => void
}

class App extends React.Component<Props> {
  private ioAdapter: IOAdapter = new IOAdapter()

  private handleConsoleOnData = (data: string) => {
    this.ioAdapter.stdin.write(data)
  }

  private handleIO = (data: string) => {
    this.props.appendConsole(data)
  }

  componentDidMount() {
    this.ioAdapter.on('data', this.handleIO)
  }

  componentWillUnmount() {
    this.ioAdapter.destroy()
  }

  render() {
    return (
      <Container>
        <SplitPane split='horizontal' defaultSize={100} minSize={50}>
          <SplitPane split='vertical'>
            <div>
              <ConnectedEditor />
            </div>
            <div>registers</div>
          </SplitPane>
          <ConnectedConsole
            onData={this.handleConsoleOnData}
          />
        </SplitPane>
      </Container>
    )
  }
}

const mapStateToProps = (state: State): Partial<Props> => ({})

const mapDispatchToProps = (dispatch: Dispatch<State>): Partial<Props> => bindActionCreators({
  appendConsole: append,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(App)