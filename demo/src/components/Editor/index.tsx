import * as React from 'react'
import {
  UnControlled as CodeMirror,
  IInstance,
} from 'react-codemirror2'

export interface Props {
  code: string
  onUpdateCode: (code: string) => void
}

export default class Editor extends React.Component<Props> {
  private handleChange = (editor: IInstance, data: any, value: string) => {
    this.props.onUpdateCode(value)
  }

  render() {
    const {
      code,
      onUpdateCode,
      ...rest,
    } = this.props

    return (
      <CodeMirror
        value={code}
        onChange={this.handleChange}
        options={{
          lineNumbers: true,
        }}
      />
    )
  }
}