/**************** FOR DEVELOPMENT ONLY ***************/
// This file is ignored in production mode!
const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function (app) {
  app.use(createProxyMiddleware("/system", { target: "http://localhost:5000" }))
  app.use(createProxyMiddleware("/api", { target: "http://localhost:5000/" }))
  app.use(
    createProxyMiddleware("/socket.io", {
      target: "http://localhost:5000",
      ws: true,
    })
  )
}
