import { useContext, useEffect } from 'react'
import {RouterContext, rootHistory} from './router'
 
function useHistory() {
  return useContext(RouterContext).history
}

function useLocation() {
  return useContext(RouterContext).location
}

function useListen(cb) {
  useEffect(() => {
    if (!rootHistory) return () => {}
    const unlisten = rootHistory.listen(location => {
      cb && cb(location)
    })

    return () => {
      unlisten && unlisten()
    }
  }, [])
}

export {
  useHistory,
  useLocation,
  useListen
}