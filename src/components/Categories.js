import React from 'react';
import { useDispatch } from '../globalState'

export default ({filters}) => {
  const dispatch = useDispatch()

  const handleFilterChange = (event) => {
    const target = event.target
    const checked = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    dispatch({type: 'SET_FILTER', name, checked})
  }

  const toggleAllFilters = (event) => {
    const checked = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    dispatch({type: 'TOGGLE_ALL', checked})
  }

  const activeFilters = filters.items.filter(f => f.active)

  if(filters.isLoading) return <span>Loading...</span>

  return (
    <ul className="sidebar-dropdown">
      <li className="sidebar-item">
        <span className={ activeFilters.length === filters.length ? "sidebar-link active" : "sidebar-link"}>
          <label><input type="checkbox" checked={ activeFilters.length === filters.items.length } onChange={toggleAllFilters} /> All</label>
        </span>
      </li>

      {filters.items.map((filter,index) => 
        <li className="sidebar-item" key={index}>
          <span className={filter.active === true ? "sidebar-link active" : "sidebar-link"}>
            <label>
              <input
                name={filter.name} 
                type="checkbox" 
                checked={filter.active === true} 
                onChange={handleFilterChange}
              /> {filter.name} {' '}
            </label>
          </span>
        </li>
      )}
    </ul>
  )
}
