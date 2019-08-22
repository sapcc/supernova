const initialState = {
  items: [],
  active: [],
  isLoading: false,
  updatedAt: null,
  error: null
}

const receiveItems = (state,{items}) => (
  {...state, 
    isLoading: false, 
    error: null, 
    items: items,
    active: items.filter(c => c.active).map(c => c.name), 
    updatedAt: Date.now()
  }
)

//const resetAll = (state) => {
//  const items = state.items.map(category => ({...category, active: false}))
//  return {...state, items, active: []}
//}
//
//const setActive = (state,{name,active}) => {
//  const index = state.items.findIndex(f => f.name === name)
//  if(index < 0) return state 
//
//  const items = state.items.map(category => ({...category, active: (category.name === name)}))
//  const activeItems = items.filter(c => c.active).map(c => c.name)
//  return {...state, items, active: activeItems}
//}
//
//export default (state = initialState, action) => {
//  switch (action.type) {
//    case 'REQUEST_CATEGORIES':
//      return {...state, isLoading: true, error: null}
//    case 'RECEIVE_CATEGORIES':
//      return receiveItems(state,action)
//    case 'REQUEST_CATEGORIES_FAILURE':
//      return {...state, isLoading: false, error: action.error}
//    case 'SET_ACTIVE_CATEGORY':
//      return setActive(state,action)
//    case 'RESET_CATEGORIES':
//      return resetAll(state,action)
//    default:
//      return state
//  }
//}


//// Resets categories dependent on area and name filters
//const reset = (state, {area,name}) => {
//  const names = Array.isArray(name) ? name : [name]
//  const areas = Array.isArray(area) ? area : [areas]
//
//  // reset all if names and areas filters are empty
//  if(names.length === 0 && areas.length === 0) {
//    return {...state, items: state.items.map(category => ({...category, active: false})), active: []}
//  }
//
//  const items = []
//  const active = []
//
//  state.items.forEach(category => {
//    const newCategory = {...category}
//    if(names.indexOf(category.name)+areas.indexOf(category.area) >= 0) {
//      newCategory.active = false
//    } 
//
//    if(newCategory.active) active.push(newCategory.name)
//    items.push(newCategory)
//  })
//  
//  return {...state, items, active}
//}
//

// toggles active status of a category
const setActive = (state,{name,active}) => {
  const names = Array.isArray(name) ? name : [name]
  let items; 
  const activeItems = []

  if(!active) {
    items = state.items.map(category => {
      const newCategory = {...category}
      if(names.indexOf(category.name) >= 0) newCategory.active = false
      if(newCategory.active) activeItems.push(newCategory.name)
      return newCategory
    })
    return {...state, items, active: activeItems}
  }

  const categoryAreas = state.items.filter(c => names.indexOf(c.name) >= 0).map(c => c.area)
  items = state.items.map(category => {
    const newCategory = {...category}
    if(categoryAreas.indexOf(category.area) >= 0) newCategory.active = names.indexOf(category.name) >= 0
    if(newCategory.active) activeItems.push(newCategory.name)
    return newCategory
  })

  return {...state, items, active: activeItems}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_CATEGORIES':
      return {...state, isLoading: true, error: null}
    case 'RECEIVE_CATEGORIES':
      return receiveItems(state,action)
    case 'REQUEST_CATEGORIES_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_ACTIVE_CATEGORY':
      return setActive(state,action)
    default:
      return state
  }
}
