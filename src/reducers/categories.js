const initialState = {
  items: [],
  isLoading: false,
  updatedAt: null,
  error: null
}

const setCategoryStatus = (state,{name,active}) => {
  const index = state.items.findIndex(f => f.name === name)
  if(index < 0) return state 
  
  const resetItems = state.items.map(category => ({...category, active: false}) )

  const newItems = resetItems.slice()
  newItems[index] = {...newItems[index], active: active}
  return {...state, items: newItems}
}

const resetAll = (state) => {
  const newItems = state.items.map(category => ({...category, active: false}) )
  return {...state, items: newItems}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_CATEGORIES':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_CATEGORIES':
      return {...state, isLoading: false, error: null, items: action.items, updatedAt: Date.now()}
    case 'REQUEST_CATEGORIESS_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_CATEGORY_STATUS':
      return setCategoryStatus(state,action)
    case 'RESET_ALL_CATEGORIES':
      return resetAll(state,action)
    default:
      return state
  }
}
