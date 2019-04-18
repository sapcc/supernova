require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const port = process.env.NODE_ENV === 'production' ? 80 : process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/system/readiness', (req,res) => res.sendStatus(200))
app.use('/system/liveliness', (req,res) => res.sendStatus(200))

app.use('/api', require('./api'))

// in production the client code is served by express.
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'build')))
  // Handle React routing, return all requests to React app
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })
}

app.listen(port, () => console.log(`Listening on port ${port}`))
