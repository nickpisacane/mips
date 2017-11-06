import * as React from 'react'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import AssembleIcon from 'material-ui/svg-icons/action/settings'
import ExecuteIcon from 'material-ui/svg-icons/av/play-arrow'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar'
import Paper from 'material-ui/Paper'

export interface Props {
  selectedCodeSample: string
  codeSamples: string[]
  onCodeSampleChange: (sample: string) => void
  onRequestAssemble: () => void
  onRequestExecute: () => void
  assembleEnabled: boolean
  executeEnabled: boolean
}

export default class Controls extends React.Component<Props> {
  private handleCodeSampleChange = (event: any, index: number, value: string) => {
    this.props.onCodeSampleChange(value)
  }

  render() {
    const {
      selectedCodeSample,
      codeSamples,
      onCodeSampleChange,
      onRequestAssemble,
      assembleEnabled,
      onRequestExecute,
      executeEnabled,
      ...rest,
    } = this.props

    return (
      <Paper zDepth={1} style={{marginBottom: '4px'}}>
        <Toolbar style={{background: '#fff'}}>
          <ToolbarGroup firstChild style={{paddingLeft: '12px'}}>
            <ToolbarTitle text='Code Samples' />
            <DropDownMenu
              value={selectedCodeSample}
              onChange={this.handleCodeSampleChange}
            >
              {codeSamples.map(sample => (
                <MenuItem
                  key={sample}
                  value={sample}
                  primaryText={sample}
                />
              ))}
            </DropDownMenu>
          </ToolbarGroup>
          <ToolbarGroup>
            <RaisedButton
              secondary
              label='Assemble'
              disabled={!assembleEnabled}
              onTouchTap={onRequestAssemble}
            />
            <ToolbarSeparator />
            <RaisedButton
              primary
              label='Execute'
              disabled={!executeEnabled}
              onTouchTap={onRequestExecute}
            />
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    )
  }
}