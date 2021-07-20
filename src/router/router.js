import React, {
  useState,
  useCallback,
  useEffect,
  createContext,
  useMemo,
} from 'react';
import {createBrowserHistory as createHistory} from 'history';

export const RouterContext = createContext();
export let rootHistory = null;

export default function Router (props) {
  const history = useMemo (() => {
    rootHistory = createHistory();
    return rootHistory;
  }, []);

  const [location, setLocation] = useState(history.location);

  useEffect (() => {
    const unlisten = history.listen(location => setLocation(location))
    return function () {
      unlisten && unlisten()
    }
  }, []);

  return (
    <RouterContext.Provider
      value={{
        location,
        history,
        match: {
          path: '/',
          url: '/',
          params: {},
          isExact: location.pathname === '/'
        }
      }}
    >
      {props.children}
    </RouterContext.Provider>
  )
}
