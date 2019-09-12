require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const configureWesocket = require('./socket')
const app = express()
const port = process.env.NODE_ENV === 'production' ? 80 : process.env.PORT || 5000
const metrics = require('./metrics')

if (process.env.NODE_ENV === 'production') { 
  // Check SSO
  app.use((req,res,next) => {
    if(!req.header('ssl-client-verify') || req.header('ssl-client-verify').toUpperCase() !== 'SUCCESS') {
      res.sendStatus(401)
    } else {
      next()
    }
  }) 
  app.use(metrics({path: '/system/metrics'}))
}




app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/system/readiness', (req,res) => res.sendStatus(200))
app.use('/system/liveliness', (req,res) => res.sendStatus(200))
//app.use(require('./metrics'))

app.use('/api', require('./api'))

const server = require('http').createServer(app)
configureWesocket(server)

// in production the client code is served by express.
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '../build')))
  // Handle React routing, return all requests to React app
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
  })
}

//app.listen(port, () => console.log(`Listening on port ${port}`))
server.listen(port, () => console.log(`Listening on port ${port}`))

module.exports = server
