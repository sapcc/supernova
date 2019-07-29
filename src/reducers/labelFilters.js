const initialState = {
  settings: {},
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

export default (state = initialState, action) => {
  switch (action.type) {
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
