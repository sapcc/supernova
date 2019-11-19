const initialState = {
  error: null,
  errorSeverity: "info"
}

const setAppError = (state, {error, errorSeverity}) => ({...state, error, errorSeverity})


export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_APP_ERROR':
        return setAppError(state,action)
    default:
      return state
  }
}