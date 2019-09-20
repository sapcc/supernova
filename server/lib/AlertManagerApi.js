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

const AlertManagerApi = {
  alerts,
  silences
}
Object.freeze(AlertManagerApi)
module.exports = AlertManagerApi
