const alertsLoader = require('./alertsLoader')
const silencesLoader = require('./silencesLoader')
const io= require('socket.io') 

const ALERTS_UPDATE = 'alerts update'
const SILENCES_UPDATE = 'silences update'

alertsLoader.start(process.env.ALERTS_UPDATE_TIMEOUT_SEC || 30)
silencesLoader.start(process.env.SILENCE_UPDATE_TIMEOUT_SEC || 300)

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)

  alertsLoader.onUpdate(alerts => {
    wsServer.sockets.emit(ALERTS_UPDATE, alerts)
  })

  silencesLoader.onUpdate(silences => {
   wsServer.sockets.emit(SILENCES_UPDATE, silences)
  })

  // INITIAL LOAD. 
  // Every time a new client connects, send current alerts this client. 
  wsServer.on('connection', socket => { 
    alertsLoader.get().then(alerts => alerts ? socket.emit(ALERTS_UPDATE, alerts) : null)
    silencesLoader.get().then(silences => silences ? socket.emit(SILENCES_UPDATE, silences) : null)
  })
}

