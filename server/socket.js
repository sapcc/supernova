const io= require('socket.io') 
const axios = require('axios')

const loadAlerts = (socket) => {
  axios
    .get(process.env.ALERTS_API_ENDPOINT)
    .then(response => {
      if(response && response.data) socket.emit('alerts update', response.data)
    })
}

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)
  
  // PERIODIC LOAD. 
  // Create a timer for periodic polling of new alerts  
  const timer = setInterval(() => loadAlerts(wsServer.sockets), 
    process.env.ALERTS_UPDATE_TIMEOUT_SEC * 1000)

  // INITIAL LOAD. 
  // Every time a new client connects, load new alerts and send them to this client. 
  wsServer.on('connection', socket => loadAlerts(socket))
}
