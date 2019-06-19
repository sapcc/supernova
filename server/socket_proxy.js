const crypto = require('crypto')
const io= require('socket.io') 


let currentAuthToken, apiWsConnection

const createAuthToken = () => {
  //console.log('ACTIVE TOKEN:', apiWsConnection && apiWsConnection.io.opts.query)
  // random expiration time between 4 and 8 hours
  //const timestamp = Math.floor(Date.now()/1000+Math.random()*60*60*4 + 60*60*4)
  const timestamp = Math.floor(Date.now()/1000+Math.random()*60*60*1 + 60)
  //const timestamp = Math.floor(Date.now()/1000+Math.random()*20 + 60)


  const signature = crypto.createHmac('sha256', process.env.BLACKHOLE_API_SECRET)
    .update(`${timestamp}`)
    .digest('base64')

  currentAuthToken = `${process.env.BLACKHOLE_API_KEY}.${signature}.${timestamp}`
  if(apiWsConnection && apiWsConnection.disconnect) {
    apiWsConnection.disconnect()
    apiWsConnection.connect()
  }
  // reconnect 60 seconds before expiration of the token
  const timeout = ((timestamp-60)*1000)-Date.now()
  //console.info('>>>>>>>>>>>>>>>>>>>>>>next reconnect in ',timeout/1000, 'sec', timeout/1000/60/60, 'hours')
  setTimeout(() => createAuthToken(), timeout)
}

createAuthToken()

// Socket connection to backend (Blackhole)
apiWsConnection = require('socket.io-client')(process.env.BLACKHOLE_ENDPOINT, { query: { authToken: currentAuthToken } })

// re-new auth token on reconnection
apiWsConnection.on('reconnect_attempt', () => {
  console.info(':::::API CLIENT RECONNECTING')
  apiWsConnection.io.opts.query = { authToken: currentAuthToken }
})

// log on disconnection
apiWsConnection.on('disconnect', () => console.info(':::::API CLIENT DISCONNECTED'))

module.exports = (server) => {
  // Socket connection to client (browser)
  const wsServer = io(server)

  // request alerts from backend and send to the client
  const loadCurrentAlerts  = () => {
    console.log('::::::REQUEST AND EMIT ALERTS:::::')
    apiWsConnection.emit('find','alerts',{},(error,data) => {
      if(data) wsServer.emit('alerts changes', {added: data.alerts})
    })
  }

  // on connection to backend load alerts
  apiWsConnection.on('connect', () => {
    console.info(':::::API CLIENT CONNECTED')
    loadCurrentAlerts()
  })

  // on socket update from backend send to client
  apiWsConnection.on('alerts created', created => {
    if (created) {
      console.info(':::::ALERTS CREATED', created.added.length, created.updated.length)
      wsServer.sockets.emit('alerts changes', created)
    }
  })

  // on connection to the client request alerts from backend
  wsServer.on('connection', socket => {
    console.info(':::::CONNECTED')
    loadCurrentAlerts()
  })
}
