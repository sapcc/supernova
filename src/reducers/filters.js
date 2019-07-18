const initialState = {
  settings: {},
  isLoading: false,
  updatedAt: null,
  error: null
}

const receiveFilters = (state,{settings}) => (
  {...state, isLoading: false, error: null, settings: {...settings}, updatedAt: Date.now()}
)
const setFilterSettings = (state,{settings}) => ({...state, settings: {...settings}})

const resetAll = (state) => {
  const newState = {...state}
  newState.settings = {...newState.settings}
  Object.keys(newState.settings).forEach(key => newState[key] = [])
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_FILTERS':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_FILTERS':
      return receiveFilters(state,action)
    case 'REQUEST_FILTERS_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_FILTER_VALUES':
      return setFilterSettings(state,action)
    case 'RESET_ALL_FILTERS':
      return resetAll(state,action)
    default:
      return state
  }
}
