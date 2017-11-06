import * as React from 'react'
import CodeIcon from 'material-ui/svg-icons/action/code'
import {
  deepPurple700 as textColor,
  indigoA700 as iconColor,
} from 'material-ui/styles/colors'
import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
`

const Anchor = styled.a`
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${textColor};
`

export default class Badge extends React.Component {
  render() {
    return (
      <Container>
        <Anchor
          href='https://github.com/nickpisacane'
          target='_blank'
        >
          <CodeIcon style={{marginRight: '6px'}} color={iconColor}/> by Nick Pisacane
        </Anchor>
      </Container>
    )
  }
}