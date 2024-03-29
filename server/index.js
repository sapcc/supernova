require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const configureWesocket = require("./socket")
const cookieParser = require("cookie-parser")
const app = express()
const port = process.env.NODE_ENV === "production" ? 80 : 5000
const metrics = require("./middlewares/metrics")

if (process.env.NODE_ENV === "production") {
  app.use(metrics({ path: "/system/metrics" }))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/system/readiness", (_, res) => res.sendStatus(200))
app.use("/system/liveliness", (_, res) => res.sendStatus(200))

app.use(express.json())
app.use(cookieParser())
app.use("/", require("./routes"))

const server = require("http").createServer(app)
server.keepAliveTimeout = 61 * 1000
server.headersTimeout = 65 * 1000 // This should be bigger than `keepAliveTimeout + your server's expected response time`

configureWesocket(server)

// in production the client code is served by express.
if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "../build")))
  // Handle React routing, return all requests to React app
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"))
  })
}

server.listen(port, () => console.log(`Listening on port ${port}`))

module.exports = server
