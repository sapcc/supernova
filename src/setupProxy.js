/**************** FOR DEVELOPMENT ONLY ***************/
// This file is ignored in production mode!
const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(proxy('/system', { target: 'http://localhost:5000' }))
  app.use(proxy('/api', { target: 'http://localhost:5000/' }));
  app.use(proxy('/socket.io', { target: 'http://localhost:5000', ws: true }))
}
