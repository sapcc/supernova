/**************** FOR DEVELOPMENT ONLY ***************/
// This file is ignored in production mode!
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/system', { target: 'http://0.0.0.0:5000' }))
  app.use(proxy('/api', { target: 'http://0.0.0.0:5000/' }));
  app.use(proxy('/socket.io', { target: 'http://0.0.0.0:5000', ws: true }))
};
