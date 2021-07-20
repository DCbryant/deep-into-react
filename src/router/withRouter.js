import React, {useContext} from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import {RouterContext} from './router'


export default function withRouter(Component) {
  const WrapComponent = (props) => {
    const context = useContext(RouterContext)
    const {wrappedComponentRef, ...reaminingProps} = props
    return (
      <Component {...reaminingProps} ref={wrappedComponentRef} {...context} />
    )
  }

  return hoistNonReactStatic(WrapComponent, Component)
}
