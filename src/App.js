import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg'
import openSocket from 'socket.io-client'
import moment from 'moment'
import axios from 'axios'
import './App.css';
import AlertsChart from './AlertsChart'

const App = () => {
  const [colors] = useState({critical: '#E74C3C', warning: '#F39C12', info: '#3498DB'})
  const [alerts, setAlerts] = useState([])
  const [filters, updateFilters] = useState([])
  const contentRef = useRef(null)

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
    socket.on('alerts changes', changes => {
      console.log('alerts changes', changes)
      setAlerts(alerts => {
        let newAlerts = alerts.slice()
        if(changes.updated) {
          changes.updated.forEach(updatedAlert => {
            const index = newAlerts.findIndex(alert => alert.fingerprint === updatedAlert.fingerprint)
            if(index => 0) newAlerts[index] = {...updatedAlert}
          })
        }
        if(changes.added) {
          changes.added.forEach(alert => newAlerts.unshift(alert))
        }

        //console.log('added',changes.added.length, 'updated', changes.updated.length)
        newAlerts = newAlerts.filter((item,index) => 
          newAlerts.findIndex(element => element.fingerprint === item.fingerprint) === index 
        )
        return sortAlerts(newAlerts)
      })
    })

    return () => socket && socket.disconnect()
  }, [])

  const sortAlerts = (alerts) => {
    return alerts.sort((a,b) => a.startsAt<b.startsAt ? 1 : a.startsAt>b.startsAt ? -1 : 0)
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

  const activeFilters = filters.filter(f => f.active)

  const items = alerts.filter(alert => {
    for(let filter of activeFilters) {
      const matches = Object.keys(filter.match_re).reduce((active, label) => {
        if(!active) return false

        const regex = new RegExp(filter.match_re[label])
        //console.log(':::::::::',label,alert.labels[label],regex, regex.test(alert.labels[label]))
      
        return regex.test(alert.labels[label]) 
      }, true)
      if(matches) return true
    }
    return false
  })

  const contentWidth = contentRef.current ? contentRef.current.getBoundingClientRect().width : 500
  
  return (
    <div className="App">
      <img src={logo} style={{width: 200, height: 200}} className="App-logo" alt="logo" />  
      
      <div className="AppContent">
        <div className="Navigation">
          <ul> 
            {filters.map((filter,index) => 
              <li key={index}>
                <input
                  name={filter.name} 
                  type="checkbox" 
                  checked={filter.active} 
                  onChange={handleFilterChange}
                /> {filter.name} {' '}
              </li>
            )}
          </ul>  
        </div>  
        <div className="Content" ref={contentRef}>

          <AlertsChart alerts={alerts} colors={colors} width={contentWidth}/>
          
          <table width="100%">
            <thead>
              <tr>
                <th style={{width: '100px'}}>
                  Region
                </th>  
                <th> 
                  Severity
                </th>  
                <th>
                  Summary        
                </th>
                <th style={{width: '150px'}}>
                  Starts At
                </th>
                <th style={{width: '150px'}}>
                  Ends At
                </th>
                <th>
                  Status
                </th>
              </tr>  
            </thead>
            <tbody>
              {items.map((alert,index) =>
                <tr key={index} className={alert.labels.severity} style={{color: colors[alert.labels.severity]}}>
                  <td>{alert.labels.region}</td>
                  <td>{alert.labels.severity}</td>
                  <td>{alert.annotations.summary}</td>
                  <td>{moment(alert.startsAt).format('DD.MM.YYYY h:mm:ss')}</td>
                  <td>{moment(alert.endsAt).format('DD.MM.YYYY h:m:ss')}</td>
                  <td>{JSON.stringify(alert.status)}</td>
                </tr>
              )}
            </tbody> 
          </table> 
        </div>
      </div>  
    </div>  
  )
}

export default App
