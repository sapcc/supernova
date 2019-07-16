/**
 * This module implements global state based on react hooks and context.
 **/

import React, { useReducer, createContext, useContext, useMemo } from 'react';

// Global State Context
const GlobalState = createContext(null)
// Dispatch Context
const Dispatch = createContext(null)

// Custom hook for global state usage
const useGlobalState = () => useContext(GlobalState)
// Custom hook for dispatch usage
const useDispatch = () => useContext(Dispatch)

/**
 * Use this function to execute code dependent on some state attributes.
 * The code will be executed only when given state props are changing!
 * useGlobalStateProps(['key.subkey'], (state) => <div>{state.key.subkey}</div>)
 **/ 
const useGlobalStateProps = (keys,fn) => {
  const state = useGlobalState()
  const values = [] 
  keys.forEach(key => {
    const path = key.split('.')
    let value = state
    do { 
      value = value[path.shift()]
    } while (value && path.length > 0)
    values.push(value)
  })

  return useMemo(() => fn(state),values)
}

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
  useGlobalStateProps,
  useDispatch,
  GlobalStateProvider
}    
