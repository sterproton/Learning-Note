import { connect } from 'react-redux'

const WrappedComponent = ({
  originComponent,
  mapStateToProps,
  mapDispatchToProps,
}) => connect(mapStateToProps, mapDispatchToProps)(originComponent)

export default WrappedComponent
