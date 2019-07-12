import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button } from 'reactstrap';
import openSocket from 'socket.io-client'
import moment from 'moment'
import axios from 'axios'
import ReactJson from 'react-json-view'


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
  // const [colors] = useState({resolved: 'green', critical: '#E74C3C', warning: '#F39C12', info: '#3498DB'})
  const [alerts, setAlerts] = useState([])
  const [filters, updateFilters] = useState([])
  const contentRef = useRef(null)
  const {modalIsShowing, toggleModal} = useModal()
  const [modalContent, setModalContent] = useState([])

  useEffect(() => {
    axios.get('/api/filters')
      .then(response => {
        response.data.forEach(f => {
          if(f.name.indexOf('critical')>=0) f.active = true
        })
        updateFilters(response.data)
      })
      .catch(e => console.error(e))  
  }, [])

  useEffect(() => {
    let socket = openSocket('/')

    // register listener for changes
    socket.on('alerts update', alerts => {
      // console.log('update alerts')
      // console.log('alerts update', alerts)
      if(alerts) {
        const newAlerts = alerts.filter((item,index) => 
          alerts.findIndex(a => a.fingerprint === item.fingerprint) === index
        )

        setAlerts(sortAlerts(newAlerts))
      }
    })
    return () => socket && socket.disconnect()
  }, [])

  const sortAlerts = (alerts) => {
    return alerts.sort((a,b) => {
      if((a.labels.severity==='critical' && b.labels.severity!=='critical') || 
         (a.labels.severity==='warning' && ['critical','warning'].indexOf(b.labels.severity) < 0)) return -1  
      else if(a.labels.severity===b.labels.severity) return 0
      else return 1
    })
  }

  const handleFilterChange = (event) => {
    const target = event.target
    const checked = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    const index = filters.findIndex(f => f.name === name)
    if(index >= 0) {
      const newFilters = filters.slice()
      newFilters[index] = {...newFilters[index], active: checked}
      updateFilters(newFilters)
    }
  }

  const toggleAllFilters = (event) => {
    const checked = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    const newFilters = filters.map(filter => ({...filter, active: checked}) )
    updateFilters(newFilters)
  }

  const activeFilters = filters.filter(f => f.active)

  const items = alerts.filter(alert => {
    //if(moment(alert.endsAt).valueOf() < Date.now()) return false 
    for(let filter of activeFilters) {
      const matches = Object.keys(filter.match_re).reduce((active, label) => {
        if(!active) return false

        const regex = new RegExp(filter.match_re[label])

        return regex.test(alert.labels[label]) 
      }, true)
      if(matches) return true
    }
    return false
  })

  const severityOrResolved = (alert) => {
    // console.log(alert);
    if (moment(alert.endsAt).valueOf() < Date.now()) {
      return "resolved"
    } else {
      return alert.labels.severity
    }
  }

  const toggleDetailsModal = (alert) => {
    const contentForModal = {
      header: <React.Fragment>Raw Data for <span className="u-text-info">&quot;{alert.annotations.summary}&quot;</span></React.Fragment>,
      body: <ReactJson src={alert} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    }
    setModalContent(contentForModal)
    toggleModal()
  }

  // const contentWidth = contentRef.current ? contentRef.current.getBoundingClientRect().width : 500

  return (
    <div className="container-fluid page">
      <div className="sidebar ">
        <div className="sidebar-brand"><FontAwesomeIcon icon="sun" className="logo" />Supernova</div>
        <ul className="sidebar-nav">
          <li className="sidebar-folder">
            <span className="sidebar-link active"><FontAwesomeIcon icon="bell" fixedWidth />Alerts</span>
            <ul className="sidebar-dropdown">
              <li className="sidebar-item">
                <span className={ activeFilters.length === filters.length ? "sidebar-link active" : "sidebar-link"}>
                  <label><input type="checkbox" checked={ activeFilters.length === filters.length } onChange={toggleAllFilters} /> All</label>
                </span>
              </li>

              {filters.map((filter,index) => 
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
          </li>
        </ul>  
      </div>  


      <div className="main">
        <nav className="navbar"></nav>

        <div className="content" ref={contentRef}>
          {/* <AlertDurationChart alerts={items} colors={colors} width={contentWidth}/> */}

          {/*<AlertsChart alerts={alerts} colors={colors} width={contentWidth}/>*/}
          <table className="table table-main">
            <thead>
              <tr>
                <th>
                  Region
                </th>  
                <th> 
                  Severity
                </th>  
                <th>
                  Title       
                </th>
                <th>
                  Starts At
                </th>
                <th>
                  Ends At
                </th>
                <th>
                  Status
                </th>
                <th></th>
              </tr>  
            </thead>
            <tbody>
              {/* IF NO ALERTS -> YAY */}
              {items.map((alert,index) =>
                <tr key={index} className={severityOrResolved(alert)} >
                  <td className="text-nowrap">{alert.labels.region}</td>
                  <td>
                    {alert.labels.severity}
                    { severityOrResolved(alert) === "resolved" &&
                        <React.Fragment>
                          <br />
                          <Badge color="success">Resolved</Badge>
                        </React.Fragment>
                    }
                  </td>
                  <td>
                    {alert.annotations.summary}
                    <br/>
                    <small className="info">{alert.annotations.description}</small>
                  </td>
                  <td>{moment(alert.startsAt).format('DD.MM.YYYY HH:mm:ss')}</td>
                  <td>{moment(alert.endsAt).format('DD.MM.YYYY HH:mm:ss')}</td>
                  <td>{JSON.stringify(alert.status)}</td>
                  <td className="u-v-align-middle"><Button outline size="sm" onClick={() => toggleDetailsModal(alert)}>Raw data</Button></td>
                </tr>
              )}
            </tbody> 
          </table> 
        </div>
      </div> 
      
      <SuperModal isShowing={modalIsShowing} hide={toggleModal} header={modalContent.header} footer={modalContent.footer} cancelButtonText={modalContent.cancelButtonText}>{modalContent.body}</SuperModal>
      

    </div>

  )
}

export default App
