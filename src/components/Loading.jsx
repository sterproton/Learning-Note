import React from 'react'
import PropTypes from 'prop-types'

const Loading = (props) => {
  if (props.error) {
    return <div>Error!</div>
  }
  return <div>loading</div>
}

Loading.propTypes = {
  error: PropTypes.bool.isRequired,
}

export default Loading
