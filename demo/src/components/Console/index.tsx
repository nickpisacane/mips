import * as React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
`

const ConsoleTextarea = styled.textarea`
  font-family: 'Roboto Mono';
  flex-grow: 1;
  width: 100%;
`

export interface Props {
  data: string
  onClear: () => void
  onData: (data: string) => void
}

export default class Console extends React.Component<Props> {
  private handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { data } = this.props
    const { value } = event.target
    const delta = value.substr(data.length)
    this.props.onData(delta)
  }

  render() {
    const {
      data,
      onClear,
      ...rest,
    } = this.props

    return (
      <Container {...rest}>
        <ConsoleTextarea value={data} onChange={this.handleTextareaChange}>
        </ConsoleTextarea>
      </Container>
    )
  }
}