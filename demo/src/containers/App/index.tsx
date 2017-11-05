import * as React from 'react'
import * as SplitPane from 'react-split-pane'
import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

export default class App extends React.Component {
  render() {
    return (
      <Container>
        <SplitPane split='horizontal' defaultSize={100} minSize={50}>
          <SplitPane split='vertical'>
            <div>code</div>
            <div>registers</div>
          </SplitPane>
          <div>
            console
          </div>
        </SplitPane>
      </Container>
    )
  }
}