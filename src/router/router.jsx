import React from 'react'
import {
  BrowserRouter as Router,
  Route, Link, Redirect,
} from 'react-router-dom'
import Loadable from 'react-loadable'
import Home from '../components/Home'
import Loading from '../components/Loading'

const LoadableComponent = Loadable({
  loader: () => import('../components/Test.jsx'),
  loading: Loading,
})

const RouteConfig = () => (
  <Router>
    <div className="container">
      <nav>
        <ul>
          <li><Link to="/">home</Link> </li>
          <li><Link to="/test">test</Link></li>
        </ul>
      </nav>
      <Route exact path="/" component={Home} />
      <Route path="/test" component={LoadableComponent} />
      <Redirect from="*" to="/" />
    </div>
  </Router>
)

export default RouteConfig
