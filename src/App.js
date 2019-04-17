import React, { useState, useEffect } from 'react';
import axios from 'axios'
import logo from './logo.svg'
import openSocket from 'socket.io-client'
import './App.css';

const App = () => {
  const [authToken, setAuthToken] = useState(null)

  useEffect(() => {
    let timer
    
    const renewToken = () => {
      axios.get('/api/auth/token').then(response => {
        const token = response.data
        const [key,signature,timeout] = token.split('.')
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
      console.log(process.env.REACT_APP_BLACKHOLE_API_ENDPOINT, authToken)
      socket = openSocket(process.env.REACT_APP_BLACKHOLE_API_ENDPOINT, {query: {authToken} })
    } 

    return () => socket && socket.disconnect()
  }, [authToken])

  return (
    <div className="App">
      <pre>{authToken}</pre>

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
