import React, { useState, useEffect, useRef } from 'react';
import openSocket from 'socket.io-client'
import axios from 'axios'

import { GlobalStateProvider, useGlobalState, useDispatch } from './globalState'
import reducers from './reducers'

import Categories from './components/Categories'
import Alerts from './components/Alerts'

import useModal from './components/shared/useModal'
import SuperModal from './components/shared/SuperModal'

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
  const {alerts, filters} = useGlobalState()
  const contentRef = useRef(null)
  const {modalIsShowing, toggleModal} = useModal()
  const [modalContent, setModalContent] = useState([])

  useEffect(() => {
    const loadFilters = () => {
      dispatch({type: 'REQUEST_FILTERS'})
      axios.get('/api/filters').then(response => {
        const filters = response.data.map(f => {f.active = true; return f})
        dispatch({type: 'RECEIVE_FILTERS', items: filters})
      }).catch(error => dispatch({type: 'REQUEST_FILTERS_FAILURE', error}))
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
            <Categories filters={filters}/>
          </li>
        </ul>  
      </div>  


      <div className="main">
        <nav className="navbar"></nav>

        <div className="content" ref={contentRef}>
          <Alerts 
            alerts={alerts} 
            filters={filters} 
            showModal={(content) => { setModalContent(content); toggleModal() }}
          />
        </div>
      </div> 
      
      <SuperModal isShowing={modalIsShowing} hide={toggleModal} header={modalContent.header} footer={modalContent.footer} cancelButtonText={modalContent.cancelButtonText}>{modalContent.body}</SuperModal>

    </div>
  )
}

export default () => <GlobalStateProvider reducers={reducers}><App/></GlobalStateProvider>
