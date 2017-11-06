import * as React from 'react'
import * as CodeMirror from 'react-codemirror'

export interface Props {
  code: string
  onUpdateCode: (code: string) => void
}

export default class Editor extends React.Component<Props> {
  render() {
    const {
      code,
      onUpdateCode,
      ...rest,
    } = this.props

    return (
      <CodeMirror
        value={code}
        onChange={onUpdateCode}
        options={{
          lineNumbers: true,
        }}
      />
    )
  }
}