import React, { useState, useEffect } from 'react';
import axios from 'axios'
import logo from './logo.svg'
import openSocket from 'socket.io-client'
import moment from 'moment'
import './App.css';

const App = () => {
  const [alerts, setAlerts] = useState([])
  const [authToken, setAuthToken] = useState(null)

 
  // re-new auth token automaticaly
  useEffect(() => {
    let timer

    const renewToken = () => {
      axios.get('/api/auth/token').then(response => {
        const token = response.data
        const [, , timeout] = token.split('.')
        setAuthToken(token)
        timer = setTimeout(renewToken,(timeout-60)*1000)
      }).catch(error => console.error(error))
    }

    timer = setTimeout(renewToken,0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let socket
    if(authToken) {

      // open socket connection
      socket = openSocket(process.env.REACT_APP_BLACKHOLE_API_ENDPOINT, {
        query: {authToken},
        //transports: [ 'websocket' ]
      })

      // load initial all active alerts
      socket.emit('find','alerts',{}, (error,data) => {
        if(data) setAlerts(sortAlerts(data.alerts))
        //console.log(alerts)

        // register listener for changes
        socket.on('alerts changes', changes => {
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
            console.log('::::::::alerts.length',alerts.length, 'newAlerts.length',newAlerts.length, alerts[0],newAlerts[0])
            return sortAlerts(newAlerts)
          })
        })
      })
    }

    return () => socket && socket.disconnect()
  }, [authToken])

  const sortAlerts = (alerts) => {
    return alerts.sort((a,b) => a.startsAt<b.startsAt ? 1 : a.startsAt>b.startsAt ? -1 : 0)
  }

  return (
    <div className="App">
      <pre>{authToken}</pre>
        <img src={logo} className="App-logo" alt="logo" />  
        <table width="100%">
          <thead>
            <tr>
              <th>
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
            {alerts.map((alert,index) =>
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
