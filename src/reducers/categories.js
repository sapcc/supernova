import {categories} from '../config.json'

const initialState = {
  items: categories,
  active: []
}

const initActiveItems = (state,{items}) => {
  const newItems = state.items.slice().map(i => {
    i.active = items.indexOf(i.name) >= 0
    return i 
  })
  return {...state, items: newItems, active: items}
}

// toggles active status of a category
const setActive = (state,{name,active}) => {
  const names = Array.isArray(name) ? name : [name]
  let items = []
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

  // Landscape category can be combined with other categories. 
  // However, within the Landscape group or all other group 
  // types the selection is exclusive.
  items = state.items.map(category => {
    const newCategory = {...category}
    // Extra treatment of the landscape category
    if(category.area === 'landscape') {
      if(categoryAreas.indexOf('landscape') >= 0) newCategory.active = names.indexOf(category.name) >= 0
    } else {
      if(categoryAreas.indexOf('landscape') < 0 && categoryAreas.length > 0) {
        newCategory.active = names.indexOf(category.name) >= 0
      }
    }
    if(newCategory.active) activeItems.push(newCategory.name)
    return newCategory
  })

  return {...state, items, active: activeItems}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_CATEGORIES_FAILURE':
      return {...state, isLoading: false, error: action.error}
    case 'SET_ACTIVE_CATEGORY':
      return setActive(state,action)
    case 'INIT_ACTIVE_ITEMS':
      return initActiveItems(state,action)  
    default:
      return state
  }
}
