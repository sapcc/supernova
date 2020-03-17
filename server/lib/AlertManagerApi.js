const axios = require("axios")
const https = require("https")
const fs = require("fs")
const path = require("path")
const certFilePath = path.join(__dirname, "/../../config/certs/")

// Available endpoints
const endpoints = [
  process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT,
  process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT_BACKUP
]

let activeIndex = 0
let activeUrl = endpoints[activeIndex]

const url = path => `${activeUrl}/${path}`
const userCert = fs.readFileSync(
  process.env.PROMETHEUS_USER_CERT_LOCATION ||
    path.join(certFilePath, "sso.crt")
)
const userKey = fs.readFileSync(
  process.env.PROMETHEUS_USER_KEY_LOCATION || path.join(certFilePath, "sso.key")
)

const alerts = async (params = {}) =>
  axios
    .get(url("alerts"), {
      ...params,
      httpsAgent: new https.Agent({
        cert: userCert,
        key: userKey
      })
    })
    .then(response => {
      console.log("activeUrl: ", activeUrl)
      return response
    })
    .then(response => response.data)
    .catch(error => {
      console.error(
        "ERROR fetching alerts from: ",
        activeUrl,
        "ERROR: ",
        error
      )
      // iterate through the endpoints array to try the next endpoint
      activeIndex = (activeIndex + 1) % endpoints.length
      activeUrl = endpoints[activeIndex]
    })
const silences = async (params = {}) =>
  axios
    .get(url(`silences`), {
      ...params,
      httpsAgent: new https.Agent({
        cert: userCert,
        key: userKey
      })
    })
    .then(response => response.data)
const createSilence = ({ matchers, startsAt, endsAt, createdBy, comment }) => {
  startsAt = startsAt || new Date().toString()
  return axios
    .post(
      url(`silences`),
      {
        matchers,
        startsAt,
        endsAt,
        createdBy,
        comment
      },
      {
        httpsAgent: new https.Agent({
          cert: userCert,
          key: userKey
        })
      }
    )
    .then(response => response.data)
    .catch(error => {
      console.log("CREATE SILENCE FAIL: ", error.message, error.response.data)
      throw new Error(error.message)
    })
}

const AlertManagerApi = {
  alerts,
  silences,
  createSilence
}
Object.freeze(AlertManagerApi)
module.exports = AlertManagerApi
