import * as React from 'react'
import { Card, CardTitle } from 'material-ui/Card'
import styled from 'styled-components'
import { Toolbar, ToolbarGroup, ToolbarTitle, ToolbarSeparator } from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/RaisedButton'

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  height: 100%;
`

const ConsoleTextarea = styled.textarea`
  font-family: 'Roboto Mono';
  flex: 1;
  display: block;
  width: 100%;
  box-sizing: border-box;
  resize: none;
`

const StyledCard = styled(Card)`
  height: 100%;
  & > div {
    height: 100%;
  }
`

export interface Props {
  data: string
  onClear: () => void
  onData: (data: string) => void
}

export default class Console extends React.Component<Props> {
  private textarea: HTMLTextAreaElement

  private textareaRef = (node: HTMLTextAreaElement | null) => {
    if (node) {
      this.textarea = node
    }
  }

  private handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { data } = this.props
    const { value } = event.target
    const delta = value.substr(data.length)
    this.props.onData(delta)
  }

  public focus() {
    if (this.textarea) {
      this.textarea.focus()
    }
  }

  render() {
    const {
      data,
      onClear,
      ...rest,
    } = this.props

    return (
      <Container {...rest}>
        <Toolbar style={{width: '100%'}}>
          <ToolbarGroup firstChild style={{paddingLeft: '12px'}}>
            <ToolbarTitle text='Console' />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarSeparator />
            <RaisedButton
              primary
              label='Clear'
              onTouchTap={onClear}
            />
          </ToolbarGroup>
        </Toolbar>
        <ConsoleTextarea
          value={data.replace(/\\n/g, '\n')}
          onChange={this.handleTextareaChange}
          innerRef={this.textareaRef}
        >
        </ConsoleTextarea>
      </Container>
    )
  }
}