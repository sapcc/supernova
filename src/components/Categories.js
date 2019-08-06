import React from 'react'
import { Badge } from 'reactstrap'
import { useDispatch } from '../lib/globalState'

const CategoryCounts = ({critical,warning,info}) => {
  return (
    <span>
      {critical && <Badge color='danger' pill>{critical}</Badge>}
      {/*{warning && <Badge color='warning'>{warning}</Badge>}
      {info && <Badge color='info'>{info}</Badge>}
      */}
    </span>
  )
}

const Categories = ({categories, counts}) => {
  const dispatch = useDispatch()

  const handleCategoryChange = (category) => {
    dispatch({type: 'SET_ACTIVE_CATEGORY', name: category.name, active: !category.active})
  }

  const resetAllCategories = (event) => {
    dispatch({type: 'RESET_CATEGORIES'})
  }

  if(categories.isLoading) return <span>Loading...</span>

  return (
    <ul className="sidebar-dropdown">
      <li className="sidebar-item" key="showall
  categories">
        <span 
          className={!categories.active.length ? "sidebar-link active" : "sidebar-link"}
          onClick={() => resetAllCategories()}>
          All
        </span>
      </li>

      {categories.items.map((category,index) => 
        <li className="sidebar-item" key={index}>
          <span 
            className={category.active === true ? "sidebar-link active" : "sidebar-link"}
            onClick={() => handleCategoryChange(category)}>
            {category.name} {counts && counts[category.name] && <CategoryCounts {...counts[category.name]}/>}
          </span>
        </li>
      )}
    </ul>
  )
}

export default Categories
