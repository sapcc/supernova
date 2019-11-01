const axios = require('axios')

const url = (path) => `${process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT}/${path}`

const alerts = async (params = {}) => 
  axios
    .get(url('alerts'), {params})
    .then(response => response.data)
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
