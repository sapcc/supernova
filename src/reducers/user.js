const initialState = {
  profile: null,
  isLoading: true,
  updatedAt: null,
  error: null
}

const request = (state) => ({...state, isLoading: true, error: null})
const receive = (state,{profile}) => ({...state, profile, isLoading: false})
const requestFailure = (state, {error}) => ({...state, isLoading: false, error})

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_USER_PROFILE':
      return request(state,action)
    case 'RECEIVE_USER_PROFILE':
      return receive(state,action)
    case 'REQUEST_USER_PROFILE_FAILURE':
      return requestFailure(state,action)
    default:
      return state
  }
}
