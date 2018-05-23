import React, { Component } from 'react'
import '../assets/scss/index.scss'
import '../assets/scss/global.scss'
import Info from './Info'
import Counter from './Counter'

class Home extends Component {
  state = {
    greeting: null,
    lazyComponent: null,
    hasLazy: false,
  }

  async componentDidMount() {
    const res = await 'hello'
    this.greeting(res)
  }

  greeting = (info) => {
    this.setState({
      greeting: info,
    })
  }

  info = {
    name: 'name',
    age: 18,
    birthday: '1900.1.1',
  }

  toggleLazy = async () => {
    if (!this.state.hasLazy) {
      const LazyComponent = (await import('./Lazy.jsx')).default // 这里是由于webpack 4将
      this.setState(prev => ({
        hasLazy: !prev.hasLazy,
        lazyComponent: LazyComponent,
      }))
    } else {
      this.setState(prev => ({
        hasLazy: !prev.hasLazy,
        lazyComponent: null,
      }))
    }
  }

  render() {
    return (
      <div className="home">
        this is a greeting: {this.state.greeting}
        <Info {...this.info} />
        <button onClick={this.toggleLazy} >toggle lazy component</button>
        <div className="lazy-component">{this.state.lazyComponent}</div>
        <Counter />
      </div>
    )
  }
}

export default Home
