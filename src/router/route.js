import React, {useContext} from 'react';
import {matchPath} from 'react-router';
import {RouterContext} from './router'

export default function Route(props) {
  const context = useContext(RouterContext)
  const location = props.location || context.location
  const match = props.computedMatch ? props.computedMatch : props.path ? matchPath(location.pathname, props) : context.match

  const newRouterProps = {...context, location, match}
  let {children, component, render} = props
  if (Array.isArray(children) && children.length === 0) {
    children = null
  }

  let renderChildren = null
  if (newRouterProps.match) {
    if (children) {
      // 当Router 是 props children 或者 render props 形式
      renderChildren = typeof children === 'function' ? children(newRouterProps) : children
    } else if(component) {
      // Route有component属性
      renderChildren = React.createElement(component, newRouterProps)
    } else if (render) {
      // Route有render属性
      renderChildren = render(newRouterProps)
    }
  }

  return (
    <RouterContext.Provider value={newRouterProps}>
      {renderChildren}
    </RouterContext.Provider>
  )

}