/**
 * This module implements global state based on react hooks and context.
 **/
import React, { useReducer, createContext, useContext } from 'react';

// Global State Context
const GlobalState = createContext(null)
// Dispatch Context
const Dispatch = createContext(null)

const DispatchLogger = createContext(null)

// Custom hook for global state usage
const useGlobalState = () => useContext(GlobalState)
// Custom hook for dispatch usage
const useDispatch = () => useContext(Dispatch)

const useDispatchLogger = () => useContext(DispatchLogger)

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

const loggers = []

const GlobalStateProvider = ({reducers, children}) => {
  const store = combineReducers(reducers)
  const [state,dispatch] = useReducer(store, store(undefined,{}))

  const myDispatch = (action) => {
    if(process.env.NODE_ENV === 'development') {
      const params = {...action}
      delete(params.type)
      console.log(action.type, Object.keys(params).length === 0 ? '' : params)
    }
    loggers.forEach(l => l(action))
    return dispatch(action)
  }

  const dispatchLogger = (fn) => loggers.push(fn) 

  return ( 
    <GlobalState.Provider value={state}>
      <Dispatch.Provider value={myDispatch}>
        <DispatchLogger.Provider value={dispatchLogger}>
          {children}
        </DispatchLogger.Provider>  
      </Dispatch.Provider>
    </GlobalState.Provider>
  )
}

export {
  useGlobalState,
  useDispatch,
  useDispatchLogger,
  GlobalStateProvider
}    
