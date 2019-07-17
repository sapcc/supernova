const initialState = {
  items: [],
  isLoading: false,
  updatedAt: null,
  error: null
}

const setFilter = (state,{name,active}) => {
  const index = state.items.findIndex(f => f.name === name)
  if(index < 0) return state 
  
  const resetItems = state.items.map(filter => ({...filter, active: false}) )

  const newItems = resetItems.slice()
  newItems[index] = {...newItems[index], active: active}
  return {...state, items: newItems}
}

const resetAll = (state) => {
  const newItems = state.items.map(filter => ({...filter, active: false}) )
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
    case 'RESET_ALL':
      return resetAll(state,action)
    default:
      return state
  }
}
