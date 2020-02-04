const axios = require('axios')

// Available endpoints
const endpoints = [process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT, process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT_BACKUP]

let activeIndex = 0
let activeUrl = endpoints[activeIndex]

const url = (path) => `${activeUrl}/${path}`

const alerts = async (params = {}) =>
  axios
    .get(url('alerts'), {params})
    .then(console.log("activeUrl: ", activeUrl))
    .then(response => response.data)
    .catch(error => {
      console.log("ERROR fetching alerts, trying different endpoint: ", activeUrl)
      // iterate through the endpoints array to try the next endpoint
      activeIndex = (activeIndex + 1) % endpoints.length
      activeUrl = endpoints[activeIndex]
    })
;

const silences = async (params = {}) =>
  axios
    .get(url(`silences`), {params})
    .then(response => response.data)
;

const createSilence = ({matchers,startsAt,endsAt,createdBy,comment}) => {
  startsAt = startsAt || (new Date()).toString()
  return axios.post(url(`silences`),{
    matchers,startsAt,endsAt,createdBy,comment
  }).then(response => response.data)
}

const AlertManagerApi = {
  alerts,
  silences,
  createSilence
}
Object.freeze(AlertManagerApi)
module.exports = AlertManagerApi
