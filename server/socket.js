const io= require('socket.io') 
const axios = require('axios')

const ALERTS_UPDATE = 'alerts update'

let currentAlerts;

const loadAlerts = async () => 
  axios
    .get(process.env.ALERTS_API_ENDPOINT)
    .then(response => response.data)
    .then(alerts => currentAlerts = alerts)
    .catch(error => {
      console.error('API ERROR: ',error)
      return []
    })

const getCurrentAlerts = async () => currentAlerts ? currentAlerts : loadAlerts()

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)
  
  // PERIODIC LOAD. 
  // Create a timer for periodic polling of new alerts  
  const timer = setInterval(() => 
    loadAlerts().then(alerts => wsServer.sockets.emit(ALERTS_UPDATE,alerts))
    , process.env.ALERTS_UPDATE_TIMEOUT_SEC * 1000
  )

  // INITIAL LOAD. 
  // Every time a new client connects, send current alerts this client. 
  wsServer.on('connection', socket => { 
    
    console.log(':::CLIENT CONNECTED:::')
    getCurrentAlerts().then(alerts => socket.emit(ALERTS_UPDATE,alerts))
  })

  server.on('upgrade', () => console.log(':::UPGRADE:::'));
}

