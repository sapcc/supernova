const initialState = {
  display: "dashboard",
  responsiveSidebarVisible: false
}

const toggleResponsiveSidebarVisible = (state) => ({...state, responsiveSidebarVisible: !state.responsiveSidebarVisible})

const setDisplayMode = (state, {display}) => ({...state, display})


export default (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_RESPONSIVE_SIDEBAR_VISIBLE':
      return toggleResponsiveSidebarVisible(state,action)
    case 'SET_DISPLAY_MODE':
      return setDisplayMode(state,action)
    default:
      return state
  }
}