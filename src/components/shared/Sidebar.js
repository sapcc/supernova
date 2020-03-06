import React from 'react'

import { useGlobalState } from '../../lib/globalState'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Categories from '../Categories'


const Sidebar = ({counts}) => {
  const state = useGlobalState()

  const {categories, layout} = state
  const responsiveSidebarVisible = layout.responsiveSidebarVisible


  return (
    <div className={`sidebar ${responsiveSidebarVisible ? 'responsive-visible' : ''}`} >
      <div className="sidebar-brand"><FontAwesomeIcon icon="sun" className="logo" />Supernova</div>
      <ul className="sidebar-nav">
        <li className="sidebar-folder">
          <span className="sidebar-category active"><FontAwesomeIcon icon="bell" fixedWidth />Alerts</span>
          <Categories categories={categories} counts={counts.category}/>
        </li>
      </ul> 
    </div> 
  ) 
}

export default Sidebar