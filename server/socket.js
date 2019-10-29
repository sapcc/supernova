const io= require('socket.io') 
const Alerts = require('./services/Alerts')
const Silences = require('./services/Silences')
const moment = require('moment')

const ALERTS_UPDATE = 'alerts update'
const SILENCES_UPDATE = 'silences update'

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)

  Alerts.addUpdateListener(result => {
    console.log(`[${moment().format('DD.MM.YYYY HH:mm')}] WEBSOCKET: alerts update.`)
    if(result) {
      const {alerts, counts, labelValues} = result
      wsServer.sockets.emit(ALERTS_UPDATE, {items: alerts,counts,labelValues})
    }
  })

  Silences.addUpdateListener(silences => {
    console.log(`[${moment().format('DD.MM.YYYY HH:mm')}] WEBSOCKET: silences update.`)
    if(silences) wsServer.sockets.emit(SILENCES_UPDATE, silences)
  })

  // INITIAL LOAD. 
  // Every time a new client connects, send current alerts and silences to this client. 
  wsServer.on('connection', socket => { 
    Alerts.get().then(result => {
      if(result) {
        console.log(`[${moment().format('DD.MM.YYYY HH:mm')}] WEBSOCKET: new connection -> get current alerts.`)
        const {alerts, counts, labelValues} = result
        socket.emit(ALERTS_UPDATE, {items:alerts,counts,labelValues}) 
      }
    })
    Silences.get().then(silences => {
      console.log(`[${moment().format('DD.MM.YYYY HH:mm')}] WEBSOCKET: new connection -> get current silences.`)
      if(silences) socket.emit(SILENCES_UPDATE, {items: silences})
    })
  })
}

