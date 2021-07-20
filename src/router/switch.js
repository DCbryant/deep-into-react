import React, {useContext} from 'react';
import {matchPath} from 'react-router'
import {RouterContext} from './router'

export default function Switch(props) {
  const context = useContext(RouterContext)
  const location = props.location || context.location
  let children, match

  React.Children.forEach(props.children, child => {
    // 路由匹配并为React.element元素的时候 
    if (!match && React.isValidElement(child)) {
      const path = child.props.path
      children = path
      match = path ? matchPath(location.pathname, {...child.props}) : context.match
    }
  })

  return match ? React.cloneElement(children, {
    location,
    computedMatch: match
  }) : null
}