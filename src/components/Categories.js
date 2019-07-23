import React from 'react';
import { useDispatch } from '../globalState'

export default ({categories,activeCategories,isLoading}) => {
  const dispatch = useDispatch()

  const handleCategoryChange = (category) => {
    dispatch({type: 'SET_ACTIVE_CATEGORY', name: category.name, active: !category.active})
  }

  const resetAllCategories = (event) => {
    dispatch({type: 'RESET_ALL_CATEGORIES'})
  }

  if(isLoading) return <span>Loading...</span>

  return (
    <ul className="sidebar-dropdown">
      <li className="sidebar-item" key="showall
  categories">
        <span 
          className={!activeCategories.length ? "sidebar-link active" : "sidebar-link"}
          onClick={() => resetAllCategories()}>
          All
        </span>
      </li>

      {categories.map((category,index) => 
        <li className="sidebar-item" key={index}>
          <span 
            className={category.active === true ? "sidebar-link active" : "sidebar-link"}
            onClick={() => handleCategoryChange(category)}>
            {category.name}
          </span>
        </li>
      )}
    </ul>
  )
}
