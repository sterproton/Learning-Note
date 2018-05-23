import React from 'react'
import PropTypes from 'prop-types'
import Wrap from '../utils/Wrap'
import { makeIncrement, makeDecrement } from '../redux/action'


const Counter = (props) => {
  const { value } = props
  return (
    <div>
      <button onClick={() => props.makeIncrement(1)}>+</button>
      <span>
        {value}
      </span>
      <button onClick={() => props.makeDecrement(1)}>-</button>
    </div>
  )
}

Counter.propTypes = {
  value: PropTypes.number.isRequired,
}

export default Wrap({
  originComponent: Counter,
  mapStateToProps: state => ({
    value: state.count,
  }),
  mapDispatchToProps: {
    makeIncrement,
    makeDecrement,
  },
})
