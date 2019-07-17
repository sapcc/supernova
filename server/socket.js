const io= require('socket.io') 
const axios = require('axios')

const ALERTS_UPDATE = 'alerts update'

let currentAlerts;

// This function sorts alerts by severity 
// critical > warning > info ...
const sortAlerts = (alerts) => 
  alerts.sort((a,b) => {
    if((a.labels.severity==='critical' && b.labels.severity!=='critical') || 
      (a.labels.severity==='warning' && ['critical','warning'].indexOf(b.labels.severity) < 0)) return -1  
    else if(a.labels.severity===b.labels.severity) return a.labels.region.localeCompare(b.labels.region)
    else return 1
  })
;


const loadAlerts = async () => 
  axios
    .get(process.env.ALERTS_API_ENDPOINT)
    .then(response => response.data)
    .then(alerts => sortAlerts(alerts))
    .then(alerts => currentAlerts = alerts)
    .catch(error => {
      console.error('API ERROR: ',error)
      return currentAlerts || []
    })

const getCurrentAlerts = async () => currentAlerts ? currentAlerts : loadAlerts()

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)

  let timeout = process.env.ALERTS_UPDATE_TIMEOUT_SEC 
  timeout = (!timeout || timeout < 20) ? 30 : timeout

  // PERIODIC LOAD. 
  // Create a timer for periodic polling of new alerts
  const timer = setInterval(() => 
    loadAlerts().then(alerts => wsServer.sockets.emit(ALERTS_UPDATE,alerts))
    , timeout * 1000
  )

  // INITIAL LOAD. 
  // Every time a new client connects, send current alerts this client. 
  wsServer.on('connection', socket => { 
    getCurrentAlerts().then(alerts => socket.emit(ALERTS_UPDATE,alerts))
  })
}

