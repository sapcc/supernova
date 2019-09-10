import React from 'react'
import { useDispatch } from '../lib/globalState'
import  CategorySeverityBadges from './shared/SeverityBadges'

const Categories = ({categories, counts}) => {
  const dispatch = useDispatch()

  const handleCategoryChange = (category) => {
    // reset all dependent filters
    if(!category.active && category.area === 'landscape') {
      Object.keys(category.match_re).forEach(key => 
        dispatch({type: 'SET_VALUES_FOR_FILTER', name: key, values: []})
      )
    }

    dispatch({type: 'SET_ACTIVE_CATEGORY', name: category.name, active: !category.active})
  }

  if(categories.isLoading) return <span>Loading...</span>

  return (
    <ul className="sidebar-dropdown">
      <li>  
        <span className="sidebar-item head">Landscape</span> 

        <ul>  
          {categories.items.filter(c => c.area === 'landscape').map((category,index) => 
            <li className="sidebar-item" key={index}>
              <span 
                className={`sidebar-link u-display-flex ${category.active === true ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}>
                {category.name} {counts && counts[category.name] && <CategorySeverityBadges {...counts[category.name].summary} className="severity-badges"/>}
              </span>
            </li>
          )}
        </ul>       
      </li>

      <li>
        <span className="sidebar-item head">Support</span>
          
        <ul>
          {categories.items.filter(c => c.area === 'support').map((category,index) => 
            <li className="sidebar-item" key={index}>
              <span 
                className={`sidebar-link ${category.active === true ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}>
                {category.name} 
              </span>
            </li>
          )}
        </ul> 
    
      </li>  
      
      <li>
        <span className="sidebar-item head">Service</span>
          
        <ul>
          {categories.items.filter(c => c.area === 'service').map((category,index) => 
            <li className="sidebar-item" key={index}>
              <span 
                className={`sidebar-link ${category.active === true ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}>
                {category.name} 
              </span>
            </li>
          )}
        </ul> 
    
      </li>     
    </ul>
  )
}

export default Categories
