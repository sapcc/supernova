const initialState = {
  items: [],
  active: [],
  isLoading: false,
  updatedAt: null,
  error: null
}

const receiveItems = (state,{items}) => (
  {...state, 
    isLoading: false, 
    error: null, 
    items: items,
    active: items.filter(c => c.active).map(c => c.name), 
    updatedAt: Date.now()
  }
)

const resetAll = (state) => {
  const items = state.items.map(category => ({...category, active: false}))
  return {...state, items, active: []}
}

const setActive = (state,{name,active}) => {
  const index = state.items.findIndex(f => f.name === name)
  if(index < 0) return state 

  const items = state.items.map(category => ({...category, active: (category.name === name)}))
  const activeItems = items.filter(c => c.active).map(c => c.name)
  return {...state, items, active: activeItems}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_CATEGORIES':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_CATEGORIES':
      return receiveItems(state,action)
    case 'REQUEST_CATEGORIES_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_ACTIVE_CATEGORY':
      return setActive(state,action)
    case 'RESET_CATEGORIES':
      return resetAll(state,action)
    default:
      return state
  }
}
