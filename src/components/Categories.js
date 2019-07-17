import React from 'react';
import { useDispatch } from '../globalState'

export default ({filters}) => {
  const dispatch = useDispatch()

  const handleFilterChange = (filter) => {
    dispatch({type: 'SET_FILTER', name: filter.name, active: !filter.active})
  }

  const resetAllFilters = (event) => {
    dispatch({type: 'RESET_ALL'})
  }

  const activeFilters = filters.items.filter(f => f.active)

  if(filters.isLoading) return <span>Loading...</span>

  return (
    <ul className="sidebar-dropdown">
      <li className="sidebar-item" key="showallfilters">
        <span 
          className={!activeFilters.length ? "sidebar-link active" : "sidebar-link"}
          onClick={() => resetAllFilters()}>
          All
        </span>
      </li>

      {filters.items.map((filter,index) => 
        <li className="sidebar-item" key={index}>
          <span 
            className={filter.active === true ? "sidebar-link active" : "sidebar-link"}
            onClick={() => handleFilterChange(filter)}>
            {filter.name}
          </span>
        </li>
      )}
    </ul>
  )
}
