const initialState = {
  items: [],
  error: null,
  isLoading: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case "REQUEST_SILENCE_TEMPLATES":
      return { ...state, isLoading: true, error: null }
    case "RECEIVE_SILENCE_TEMPLATES":
      return {
        ...state,
        isLoading: false,
        error: null,
        items: action.templates,
      }
    case "REQUEST_SILENCE_TEMPLATES_ERROR":
      return { ...state, isLoading: false, error: action.error }
    default:
      return state
  }
}
