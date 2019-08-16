const initialState = {
  settings: {},
  extraFiltersVisible: false,
  isLoading: false,
  updatedAt: null,
  error: null
}

const receive = (state,{settings}) => (
  {...state, 
    isLoading: false, 
    error: null, 
    settings, 
    updatedAt: Date.now()
  }
)
const setFilters = (state,{settings}) => ({...state, settings: {...settings}})

const resetAll = (state) => {
  const newState = {...state, settings: {}}
  Object.keys(state.settings).forEach(label => newState.settings[label] = [])
  return newState
}

const setValuesForFilter = (state, {action, name, values}) => (
  {...state, settings: {...state.settings, [name]: values}}
)

const addFilter = (state, {name, value}) => {
  const oldValues = state.settings[name].slice()
  // check if we are already filtering by this value
  if (oldValues.findIndex(val => val === value) > -1) {
    return state
  } else {
    const newValues = [...oldValues, value]
    return {...state, settings: {...state.settings, [name]: newValues}}
  }
}

const removeFilter = (state, {name, value}) => {
  const oldValues = state.settings[name].slice()
  const newValues = oldValues.filter(val => val !== value) // remove value from values list
  return {...state, settings: {...state.settings, [name]: newValues}}
}

const setExtraFiltersVisible = (state, {visible}) => (
  {...state, extraFiltersVisible: visible}
)



export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_EXTRA_FILTERS_VISIBLE':
      return setExtraFiltersVisible(state,action)
    case 'SET_VALUES_FOR_FILTER':
      return setValuesForFilter(state,action)
    case 'ADD_FILTER':
      return addFilter(state,action)
    case 'REMOVE_FILTER':
      return removeFilter(state,action) 
    case 'REQUEST_LABEL_FILTERS':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_LABEL_FILTERS':
      return receive(state,action)
    case 'REQUEST_LABEL_FILTERS_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_LABEL_FILTERS':
      return setFilters(state,action)
    
    case 'RESET_LABEL_FILTERS':
      return resetAll(state,action)
    default:
      return state
  }
}
