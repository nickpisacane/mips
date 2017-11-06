import * as React from 'react'
import { render } from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import * as injectTapEventPlugin from 'react-tap-event-plugin'
import { Provider } from 'react-redux'

import createStore from './createStore'
import App from './containers/App'
import Badge from './components/Badge'

injectTapEventPlugin()

const store = createStore()

render((
  <Provider store={store}>
    <MuiThemeProvider>
      <App />
      <Badge />
    </MuiThemeProvider>
  </Provider>
), document.querySelector('#app'))
