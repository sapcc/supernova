const AlertsLoader = require('./AlertsLoader')
const SilencesLoader = require('./SilencesLoader')
const io= require('socket.io') 

const ALERTS_UPDATE = 'alerts update'
const SILENCES_UPDATE = 'silences update'

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)

  AlertsLoader.start(alerts => {
   wsServer.sockets.emit(ALERTS_UPDATE, alerts)
  })

  SilencesLoader.start(silences => {
   wsServer.sockets.emit(SILENCES_UPDATE, silences)
  })

  // INITIAL LOAD. 
  // Every time a new client connects, send current alerts this client. 
  wsServer.on('connection', socket => { 
    AlertsLoader.get().then(alerts => {
      return alerts && alerts.items ? socket.emit(ALERTS_UPDATE, alerts) : null
    })
    SilencesLoader.get().then(silences => {
      return silences && silences.items ? socket.emit(SILENCES_UPDATE, silences) : null
    })
  })
}

