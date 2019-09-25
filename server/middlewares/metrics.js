//const promBundle = require("express-prom-bundle")
//const metricsMiddleware = promBundle({metricsPath: '/system/metrics', includeMethod: true})
//module.exports = metricsMiddleware
//
const express = require('express')
const client = require('prom-client')

const histogram = new client.Histogram({
  name: 'supernova_http_request_duration',
  help: 'request duration Histogramtogram for supernova',
  labelNames: ['code','method','path']
})

const counter = new client.Counter({
  name: 'supernova_http_server_requests_total',
  help: 'count of requests for supernova',
  labelNames: ['code','method','path']
})

const exceptionCounter = new client.Counter({
  name: 'supernova_http_server_exceptions_total',
  help: 'count of exceptions for supernova',
  labelNames: ['code','method','path', 'exception']
})

module.exports = (options = {}) => {
  const metricsPath = options['path'] || '/metrics'
  const app = express()

  // endpoint for metrics
  app.get('/system/metrics', (req,res) => {
    res.set('Content-Type', client.register.contentType)
    res.end(client.register.metrics())
  })

  // middleware to collect histogram and counters for requests
  app.use( (req,res,next) => {
    const path = req.path || eeq.originalUrl || path.url
    const code = res.statusCode
    const method = req.method
    const end = histogram.startTimer()
    
    counter.inc({code, method, path})
    
    res.once('finish', () => end({code, method, path}) )
    next()
  })

  // middleware to collect exceptions
  app.use( (err, req, res, next) => {
    exceptionCounter.inc({code: res.statusCode, method: req.method, path: req.path})
    next()
  })

  return app
}
