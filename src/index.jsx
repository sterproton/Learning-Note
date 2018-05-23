import React from 'react'
import reactDom from 'react-dom'
import Route from './router/router'
import { Provider } from 'react-redux'
import store from './redux/store'

const app = document.getElementById('app')

if (module.hot) {
  reactDom.unmountComponentAtNode(app)
  module.hot.accept()
}

reactDom.render(
  <Provider store={store}>
    <Route />
  </Provider>, app)
