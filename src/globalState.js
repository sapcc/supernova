/**
 * This module implements global state based on react hooks and context.
 **/
import React, { useReducer, createContext, useContext } from 'react';

// Global State Context
const GlobalState = createContext(null)
// Dispatch Context
const Dispatch = createContext(null)

// Custom hook for global state usage
const useGlobalState = () => useContext(GlobalState)
// Custom hook for dispatch usage
const useDispatch = () => useContext(Dispatch)


// This function combines multiple reducers.
const combineReducers = (reducer) => {
  if(typeof reducer === 'function') return reducer
  const keys = Object.keys(reducer)

  return (state = {}, action) => {
    const nextReducers = {}
    keys.forEach(key => nextReducers[key] = reducer[key](state[key], action))
    return nextReducers
  }
}

const GlobalStateProvider = ({reducers, children}) => {
  const store = combineReducers(reducers)
  const [state,dispatch] = useReducer(store, store(undefined,{}))

  return ( 
    <GlobalState.Provider value={state}>
      <Dispatch.Provider value={dispatch}>
        {children}
      </Dispatch.Provider>
    </GlobalState.Provider>
  )
}

export {
  useGlobalState,
  useDispatch,
  GlobalStateProvider
}    
