const alertsLoader = require('./alertsLoader')
const io= require('socket.io') 

const ALERTS_UPDATE = 'alerts update'

alertsLoader.start(process.env.ALERTS_UPDATE_TIMEOUT_SEC || 30)

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)

  alertsLoader.onUpdate(alerts => {
    wsServer.sockets.emit(ALERTS_UPDATE, alerts)
  })

  // INITIAL LOAD. 
  // Every time a new client connects, send current alerts this client. 
  wsServer.on('connection', socket => { 
    alertsLoader.get().then(alerts => socket.emit(ALERTS_UPDATE, alerts))
  })
}

