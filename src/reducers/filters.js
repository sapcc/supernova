const initialState = {
  labels: {},
  categories: [],
  isLoading: false,
  updatedAt: null,
  error: null
}

const receiveFilters = (state,{filters}) => (
  {...state, 
    isLoading: false, 
    error: null, 
    categories: filters.categories,
    labels: filters.labels, 
    updatedAt: Date.now()
  }
)
const setFilterLabels = (state,{labels}) => ({...state, labels: {...labels}})
const setFilterCategories = (state,{categories}) => ({...state, categories: categories.slice()})

const resetAllCategories = (state) => {
  const newCategories = state.categories.map(category => ({...category, active: false}))
  return {...state, categories: newCategories}
}

const resetAllLabels = (state) => {
  const newState = {...state, labels: {}}
  Object.keys(state.labels).forEach(label => newState.labels[label] = [])
  return newState
}

const resetAll = (state) => {
  resetAllCategories()
  resetAllLabels()
}

const setActiveCategory = (state,{name,active}) => {
  const index = state.categories.findIndex(f => f.name === name)
  if(index < 0) return state 
  
  const newCategories = state.categories.map(category => (
    {...category, active: category.name === name ? true : false}) 
  )
  return {...state, categories: newCategories}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_FILTERS':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_FILTERS':
      return receiveFilters(state,action)
    case 'REQUEST_FILTERS_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_FILTER_LABELS':
      return setFilterLabels(state,action)
    case 'SET_ACTIVE_CATEGORY':
      return setActiveCategory(state,action)
    case 'RESET_ALL_LABELS':
      return resetAllLabels(state,action)
    case 'SET_FILTER_CATEGORIES':
      return setFilterCategories(state,action)
    case 'RESET_ALL_CATEGORIES':
      return resetAllCategories(state,action)
    case 'RESET_ALL':
      return resetAll(state,action)
    default:
      return state
  }
}
