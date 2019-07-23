import React, { useState, useMemo, useEffect, useRef } from 'react';
import openSocket from 'socket.io-client'
import axios from 'axios'

import { GlobalStateProvider, useGlobalState, useDispatch } from './globalState'
import reducers from './reducers'

import Categories from './components/Categories'
import Alerts from './components/Alerts'

import useModal from './components/shared/useModal'
import SuperModal from './components/shared/SuperModal'

import useUrlFilters from './components/shared/useUrlFilters'

import './styles/theme.scss'
import './App.css'
// import AlertsChart from './AlertsChart'
// import AlertDurationChart from './AlertDurationChart'

// Icons --------------------------------------------------------
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBell, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// build icon library, only needs to be done once, then the icon will be available everywhere
library.add( faBell, faSun )
// --------------------------------------------------------------

const App = () => {
  const dispatch = useDispatch()
  const state = useGlobalState()
  const {alerts, filters} = state
  const contentRef = useRef(null)
  const {modalIsShowing, toggleModal} = useModal()
  const [modalContent, setModalContent] = useState([])
  const [urlFilters,setUrlFilters] = useUrlFilters(['category','label'])

  const activeCategories = useMemo(() => filters.categories.filter(c => c.active), [filters.categories])

  useEffect(() => {
    setUrlFilters({"category": activeCategories.map(f => f.name),"label": filters.labels})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[activeCategories,filters.labels])

  useEffect(() => {
    const loadFilters = () => {
      dispatch({type: 'REQUEST_FILTERS'})
      axios.get('/api/filters')
        .then(response => response.data)
        .then(filters => {
          if(urlFilters.category) {
            filters.categories.forEach(c => c.active = urlFilters.category.indexOf(c.name) > -1 ? true : false)
          }
          if(urlFilters.label) { 
            filters.labels = Object.assign(filters.labels,urlFilters.label)
          }
          return filters
        })
        .then(filters => dispatch({type:'RECEIVE_FILTERS', filters}))
        .catch(error => dispatch({type: 'REQUEST_FILTERS_FAILURE'}))
    }

    const loadAlerts = () => {
      dispatch({type: 'REQUEST_ALERTS'})
      let socket = openSocket('/')
      socket.on('alerts update', alerts => {
        if(alerts) dispatch({type: 'RECEIVE_ALERTS', items: alerts})
      })
    }   

    loadFilters()
    loadAlerts()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
 
  return (
    <div className="container-fluid page">
      <div className="sidebar ">
        <div className="sidebar-brand"><FontAwesomeIcon icon="sun" className="logo" />Supernova</div>
        <ul className="sidebar-nav">
          <li className="sidebar-folder">
            <span className="sidebar-link active"><FontAwesomeIcon icon="bell" fixedWidth />Alerts</span>
            <Categories 
              categories={filters.categories} 
              activeCategories={activeCategories}
              isLoading={filters.isLoading}
            />
          </li>
        </ul>  
      </div>  


      <div className="main">
        <nav className="navbar"></nav>

        <div className="content" ref={contentRef}>
          <Alerts 
            alerts={alerts} 
            filterLabels={filters.labels} 
            activeCategories={activeCategories}
            showModal={(content) => { setModalContent(content); toggleModal() }}
          />
        </div>
      </div> 
      
      <SuperModal isShowing={modalIsShowing} hide={toggleModal} header={modalContent.header} footer={modalContent.footer} cancelButtonText={modalContent.cancelButtonText}>{modalContent.body}</SuperModal>

    </div>
  )
}

export default () => <GlobalStateProvider reducers={reducers}><App/></GlobalStateProvider>
