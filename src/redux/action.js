export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'

const createIncrement = value => ({
  type: INCREMENT,
  value,
})

const createDecrement = value => ({
  type: DECREMENT,
  value,
})

export const makeIncrement = value => dispatch => dispatch(createIncrement(value))
export const makeDecrement = value => dispatch => dispatch(createDecrement(value))
