import React, {useMemo} from 'react'
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

  const activeLandscapeCategory = useMemo(() => 
    categories.items.find(c => c.area === 'landscape' && c.active)
    ,[categories.items]
  )

  // calculate category counts.
  // result is the minimum of current category and if selected the landscape category.
  const categoryCounts = (category) => {
    if(!activeLandscapeCategory) return counts[category.name]

    const lCounts = counts[activeLandscapeCategory.name]
    const {critical,warning,info} = counts[category.name]
    const result = {
      critical: critical && lCounts.critical && Math.min(critical,lCounts.critical),
      warning: warning && lCounts.warning && Math.min(warning,lCounts.warning),
      info: info && lCounts.info && Math.min(info,lCounts.info),
    }
    return result
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
                {category.name} {counts && counts[category.name] && <CategorySeverityBadges {...counts[category.name]} small/>}
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
                {category.name} {counts && counts[category.name] && 
                  <CategorySeverityBadges small {...categoryCounts(category)}/>
                }
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
                {category.name} {counts && counts[category.name] && 
                  <CategorySeverityBadges small {...categoryCounts(category)}/>
                }
              </span>
            </li>
          )}
        </ul> 
    
      </li>     
    </ul>
  )
}

export default Categories
