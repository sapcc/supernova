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
const update = (state,{settings}) => ({...state, settings: Object.assign(state.settings, settings)})

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_APPLICATION_SETTINGS':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_APPLICATION_SETTINGS':
      return receive(state,action)
    case 'REQUEST_APPLICATION_SETTINGS_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'UPDATE_APPLICATION_SETTINGS':
      return update(state,action)
    default:
      return state
  }
}
