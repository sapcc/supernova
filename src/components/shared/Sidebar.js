import React from 'react'

import { useGlobalState, useDispatch } from '../../lib/globalState'

import {Button, ButtonGroup} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Categories from '../Categories'


const Sidebar = ({counts, currentDisplayMode}) => {
  const state = useGlobalState()
  const dispatch = useDispatch()

  const {categories, layout} = state
  const responsiveSidebarVisible = layout.responsiveSidebarVisible

  const setDisplayMode = (mode) => {
    dispatch({type: 'SET_DISPLAY_MODE', display: mode})
    dispatch({type: 'TOGGLE_RESPONSIVE_SIDEBAR_VISIBLE'})
  }

  return (
    <div className={`sidebar ${responsiveSidebarVisible ? 'responsive-visible' : ''}`} >
      <div className="sidebar-brand"><FontAwesomeIcon icon="sun" className="logo" />Supernova</div>
      <ul className="sidebar-nav">
        <li className="sidebar-folder">
          <span className="sidebar-link active"><FontAwesomeIcon icon="bell" fixedWidth />Alerts</span>
          <Categories categories={categories} counts={counts.category}/>
        </li>
      </ul> 
    </div> 
  ) 
}

export default Sidebar