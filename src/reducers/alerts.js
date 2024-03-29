const initialState = {
  items: [],
  counts: {},
  labelValues: {},
  showTarget: null,
  isLoading: false,
  updatedAt: null,
  error: null,
}

const request = (state) => ({ ...state, isLoading: true, error: null })

const receive = (state, { items, counts, labelValues }) => {
  const newAlerts = items.filter(
    (item, index) =>
      items.findIndex((a) => a.fingerprint === item.fingerprint) === index
  )
  return {
    ...state,
    isLoading: false,
    items: newAlerts,
    error: null,
    updatedAt: Date.now(),
    counts,
    labelValues,
  }
}

const requestFailure = (state, { error }) => ({
  ...state,
  isLoading: false,
  error,
})

const setShowTarget = (state, { showTarget }) => ({
  ...state,
  showTarget: showTarget,
})

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "REQUEST_ALERTS":
      return request(state, action)
    case "RECEIVE_ALERTS":
      return receive(state, action)
    case "REQUEST_ALERTS_FAILURE":
      return requestFailure(state, action)
    case "SET_SHOW_TARGET":
      return setShowTarget(state, action)
    default:
      return state
  }
}

export default reducer
