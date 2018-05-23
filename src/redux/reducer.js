import { combineReducers } from 'redux'
import { INCREMENT, DECREMENT } from './action'

const count = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + action.value
    case DECREMENT:
      return state - action.value
    default:
      return state
  }
}

const rootReducer = combineReducers({
  count,
})

export default rootReducer
