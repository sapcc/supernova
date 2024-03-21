const initialState = {
  items: [],
  isLoading: false,
  updatedAt: null,
  error: null,
}

const request = (state) => ({ ...state, isLoading: true, error: null })

const receive = (state, { items }) => {
  const newItems = items.filter(
    (item, index) => items.findIndex((i) => i.id === item.id) === index
  )
  return {
    ...state,
    isLoading: false,
    items: newItems,
    error: null,
    updatedAt: Date.now(),
  }
}

const requestFailure = (state, { error }) => ({
  ...state,
  isLoading: false,
  error,
})

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "REQUEST_SILENCES":
      return request(state, action)
    case "RECEIVE_SILENCES":
      return receive(state, action)
    case "REQUEST_SILENCES_FAILURE":
      return requestFailure(state, action)
    default:
      return state
  }
}

export default reducer
