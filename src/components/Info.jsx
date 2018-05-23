import React from 'react'
import PropTypes from 'prop-types'

const Info = (props) => {
  const { name, age, birthday } = props
  return (
    <div className="Info">
      your name is {name}, your age is {age}, your birthday is {birthday}
    </div>
  )
}

Info.defaultProps = {
  name: 'default',
  age: 1,
  birthday: 'default',
}

Info.propTypes = {
  name: PropTypes.string,
  age: PropTypes.number,
  birthday: PropTypes.string,
}

export default Info
