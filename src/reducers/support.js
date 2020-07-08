const initialState = {
  contacts: {}
}

const setContacts = (state, {contacts}) => ({...state, contacts})


export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SUPPORT_CONTACTS':
        return setContacts(state,action)
    default:
      return state
  }
}