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

  if(categories.isLoading) return <span>Loading...</span>

  return (
    <ul className="sidebar-dropdown">
      <li>  
        <span className="sidebar-item head">Landscape</span> 

        <ul>  
          {categories.items.filter(c => c.area === 'landscape').map((category,index) => 
            <li className="sidebar-item" key={index}>
              <span 
                className={category.active === true ? "sidebar-link active" : "sidebar-link"}
                onClick={() => handleCategoryChange(category)}>
                {category.name} {counts && counts[category.name] && <CategoryCounts {...counts[category.name]}/>}
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
                className={category.active === true ? "sidebar-link active" : "sidebar-link"}
                onClick={() => handleCategoryChange(category)}>
                {category.name} {/*counts && counts[category.name] && <CategoryCounts {...counts[category.name]}/>*/}
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
                className={category.active === true ? "sidebar-link active" : "sidebar-link"}
                onClick={() => handleCategoryChange(category)}>
                {category.name} {/*counts && counts[category.name] && <CategoryCounts {...counts[category.name]}/>*/}
              </span>
            </li>
          )}
        </ul> 
    
      </li>     
    </ul>
  )
}

export default Categories
