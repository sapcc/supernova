const crypto = require('crypto')
const io= require('socket.io') 


let currentAuthToken, apiWsConnection

const createAuthToken = () => {
  const timestamp = Math.floor(Date.now()/1000+Math.random()*60*59*2+60)
  const signature = crypto.createHmac('sha256', process.env.BLACKHOLE_API_SECRET)
    .update(`${timestamp}`)
    .digest('base64')

  currentAuthToken = `${process.env.BLACKHOLE_API_KEY}.${signature}.${timestamp}`
  if(apiWsConnection && apiWsConnection.reconnect) apiWsConnection.reconnect()
  setTimeout(createAuthToken, (timestamp-60)*1000)
}

createAuthToken()

apiWsConnection = require('socket.io-client')(process.env.BLACKHOLE_ENDPOINT, { query: { authToken: currentAuthToken } })

apiWsConnection.on('reconnect_attempt', () => {
  console.log('API CLIENT RECONNECTING')
  apiWsConnection.io.opts.query = { authToken: currentAuthToken }
})

apiWsConnection.on('connect', () => console.log('API CLIENT CONNECTED'))
apiWsConnection.on('disconnect', () => console.log('API CLIENT DISCONNECTED'))

module.exports = (server) => {
  const wsServer = io(server)
  
  apiWsConnection.on('alerts changes', changes => {
    console.log(':::::::::::::::::CHANGES',changes.added.length,changes.updated.length)
    wsServer.sockets.emit('alerts changes', changes)
  })

  wsServer.on('connection', socket => {
    console.log('::::::::::::::::::::CONNECTED')

    apiWsConnection.emit('find','alerts',{},(error,data) => {
      socket.emit('alerts changes', {added: data.alerts})
    })
  })
}
