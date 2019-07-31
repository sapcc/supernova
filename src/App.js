import React, { useState, useEffect, useRef } from 'react';
import openSocket from 'socket.io-client'
import axios from 'axios'

import { GlobalStateProvider, useGlobalState, useDispatch } from './globalState'
import reducers from './reducers'

import Categories from './components/Categories'
import Alerts from './components/Alerts'
import Filters from './components/Filters'

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
  const {alerts, categories, labelFilters} = state
  const contentRef = useRef(null)
  const {modalIsShowing, toggleModal} = useModal()
  const [modalContent, setModalContent] = useState([])
  const [urlFilters,setUrlFilters] = useUrlFilters(['category','label'])

  useEffect(() => {
    setUrlFilters({"category": categories.active, "label": labelFilters.settings})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[categories.active,labelFilters.settings])

  useEffect(() => {
    // load default values
    const loadConfig = () => {
      dispatch({type: 'REQUEST_CATEGORIES'})
      dispatch({type: 'REQUEST_FILTERS'})
      axios.get('/api/config')
        .then(response => response.data)
        .then(config => {
          // extend default values with values from URL
          if(urlFilters.category) {
            config.categories.forEach(c => c.active = (urlFilters.category.indexOf(c.name) > -1))
          }
          if(urlFilters.label) { 
            config.labelFilters = Object.assign(config.labelFilters, urlFilters.label)
          }
          return config
        })
        .then(config => {
          dispatch({type:'RECEIVE_CATEGORIES', items: config.categories})
          dispatch({type:'RECEIVE_LABEL_FILTERS', settings: config.labelFilters})
        })
        .catch(error => { 
          dispatch({type: 'REQUEST_CATEGORIES_FAILURE'})
          dispatch({type: 'REQUEST_LABEL_FILTERS_FAILURE'})
        })
    }

    const loadAlerts = () => {
      dispatch({type: 'REQUEST_ALERTS'})
      let socket = openSocket('/')
      socket.on('alerts update', alerts => {
        const {items,counts,labelValues} = alerts
        if(alerts) dispatch({type: 'RECEIVE_ALERTS', items,counts,labelValues})
      })
    }   

    loadConfig()
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
            <Categories categories={categories} counts={alerts.counts.category}/>
          </li>
        </ul>  
      </div>  


      <div className="main">
        <nav className="navbar"></nav>

        <div className="content" ref={contentRef}>
          <Filters filterLabels={labelFilters.settings, alerts.labelValues} />
          <Alerts 
            alerts={alerts} 
            labelFilters={labelFilters} 
            categories={categories}
            showModal={(content) => { setModalContent(content); toggleModal() }}
          />
        </div>
      </div> 
      
      <SuperModal isShowing={modalIsShowing} hide={toggleModal} header={modalContent.header} footer={modalContent.footer} cancelButtonText={modalContent.cancelButtonText}>{modalContent.body}</SuperModal>

    </div>
  )
}

export default () => <GlobalStateProvider reducers={reducers}><App/></GlobalStateProvider>
