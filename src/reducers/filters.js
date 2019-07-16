const initialState = {
  items: [],
  isLoading: false,
  updatedAt: null,
  error: null
}

const setFilter = (state,{name,checked}) => {
  const index = state.items.findIndex(f => f.name === name)
  if(index < 0) return state 
  
  const newItems = state.items.slice()
  newItems[index] = {...newItems[index], active: checked}
  return {...state, items: newItems}
}

const toggleAll = (state,{checked}) => {
  const newItems = state.items.map(filter => ({...filter, active: checked}) )
  return {...state, items: newItems}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_FILTERS':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_FILTERS':
      return {...state, isLoading: false, error: null, items: action.items, updatedAt: Date.now()}
    case 'REQUEST_FILTERS_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_FILTER':
      return setFilter(state,action)
    case 'TOGGLE_ALL':
      return toggleAll(state,action)
    default:
      return state
  }
}
