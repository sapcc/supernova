const initialState = {
  display: "dashboard",
  layoutMode: "standard",
  responsiveSidebarVisible: false
}

const toggleResponsiveSidebarVisible = (state) => ({...state, responsiveSidebarVisible: !state.responsiveSidebarVisible})

const setDisplayMode = (state, {display}) => ({...state, display})

const setLayoutMode = (state, {layoutMode}) => ({...state, layoutMode})



export default (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_RESPONSIVE_SIDEBAR_VISIBLE':
      return toggleResponsiveSidebarVisible(state,action)
    case 'SET_DISPLAY_MODE':
      return setDisplayMode(state,action)
    case 'SET_LAYOUT_MODE':
      return setLayoutMode(state,action)
    default:
      return state
  }
}