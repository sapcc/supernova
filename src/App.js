import React, { useState, useEffect } from 'react';
import logo from './logo.svg'
import openSocket from 'socket.io-client'
import moment from 'moment'
import './App.css';

const App = () => {
  const [filters,setFilters] = useState({critical: true, warning: false, info: false})
  const [alerts, setAlerts] = useState([])

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
        if(changes.deleted) {
          const fingerprints = changes.deleted.map(deletedAlert => deletedAlert.fingerprint)
          newAlerts = newAlerts.filter(fingerprints.indexOf(alert.fingerprint)<0)
        }
        //console.log('added',changes.added.length, 'updated', changes.updated.length)
        newAlerts = newAlerts.filter((item,index) => newAlerts.indexOf(item) === index)
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
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    console.log(':::handleFilterChange',name,value)
    setFilters({...filters, [name]: value})
  }

  return (
    <div className="App">
      <img src={logo} style={{width: 200, height: 200}} className="App-logo" alt="logo" />  

      <div style={{height: 40}}>
        <input name="critical" type="checkbox" checked={filters.critical} onChange={handleFilterChange}/> critical {' '}
        <input name="warning" type="checkbox" checked={filters.warning} onChange={handleFilterChange}/> warning {' '}
        <input name="info" type="checkbox" checked={filters.info} onChange={handleFilterChange}/> info {' '}
      </div>  
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
          {alerts.filter(alert => filters[alert.labels.severity]).map((alert,index) =>
            <tr key={index} className={alert.labels.severity} style={{color: alert.labels.severity === 'critical' ? 'red' : alert.labels.severity === 'warning' ? 'orange' : 'blue'}}>
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
  )
}

export default App
