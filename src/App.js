import React, { useState, useEffect, useRef } from 'react';
import openSocket from 'socket.io-client'
import axios from 'axios'

import { GlobalStateProvider, useGlobalState, useDispatch } from './lib/globalState'
import reducers from './reducers'

import Categories from './components/Categories'
import Alerts from './components/Alerts'
import Filters from './components/Filters'
import Regions from './components/Regions'
import DevTools from './components/DevTools'

import useModal from './lib/hooks/useModal'
import SuperModal from './components/shared/SuperModal'

import useUrlFilters from './lib/hooks/useUrlFilters'

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
  const initialURLFilters = useUrlFilters({"category": categories.active, "label": labelFilters.settings})


  useEffect(() => {
    // load default values
    const loadConfig = () => {
      dispatch({type: 'REQUEST_CATEGORIES'})
      dispatch({type: 'REQUEST_FILTERS'})
      axios.get('/api/config')
        .then(response => response.data)
        .then(config => {
          // extend default values with values from URL
          if(initialURLFilters.category) {
            config.categories.forEach(c => c.active = (initialURLFilters.category.indexOf(c.name) > -1))
          }
          if(initialURLFilters.label) { 
            config.labelFilters = Object.assign(config.labelFilters, initialURLFilters.label)
            dispatch({type: 'SET_EXTRA_FILTERS_VISIBLE', visible: true}) // if we have initial filters via URL ensure that extra filter panel is visible (ideally we would toggle it only if the url-provided filter is one of the hidden ones but I haven't figured out a way to get past the race condition of the useFilters hook with the loadConfig process)
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
        <nav className="navbar">
          <Regions items={alerts.labelValues ? alerts.labelValues['region'] : null}/>
        </nav>

        <div className="content" ref={contentRef}>
          <Filters filterLabels={labelFilters.settings} labelValues={alerts.labelValues} />
          <Alerts 
            alerts={alerts} 
            labelFilters={labelFilters} 
            categories={categories}
            showModal={(content) => { setModalContent(content); toggleModal() }}
          />
        </div>
      </div> 
      
      <SuperModal isShowing={modalIsShowing} hide={toggleModal} header={modalContent.header} footer={modalContent.footer} cancelButtonText={modalContent.cancelButtonText}>{modalContent.body}</SuperModal>

      {process.env.NODE_ENV === 'development' && <DevTools/>}
    </div>
  )
}

export default () => <GlobalStateProvider reducers={reducers}><App/></GlobalStateProvider>
