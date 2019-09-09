const axios = require('axios')

const headers = { 'Authorization': `Token token=${process.env.REACT_APP_PAGERDUTY_API_TOKEN}` }
const url = (path) => `${process.env.REACT_APP_PAGERDUTY_API_ENDPOINT}/${path}`

const incidents = async (params = {}) => 
  axios
    .get(url('incidents'), {headers,params})
    .then(response => response.data && response.data.incidents)
;

const incidentAlerts = async (incidentId,params = {}) =>
  axios
    .get(url(`incidents/${incidentId}/alerts`), {headers,params})
    .then(response => response.data && response.data.alerts)
;

const alertsWithIncidentStatus = async (incidentStatus) => {
  const tmpIncidents = await incidents({ "statuses[]": incidentStatus})
  const alertPromises = tmpIncidents.map(i => 
    incidentAlerts(i.id).then(alerts => alerts.map(a => {
      a.incident = i
      return a
    }))
  )
  return Promise
    .all(alertPromises)
    .then(array => array.flat())
}

const PagerDutyApi = {
  incidents,
  incidentAlerts,
  acknowledgedAlerts: async () => alertsWithIncidentStatus('acknowledged'),
  resolvedAlerts: async () => alertsWithIncidentStatus('resolved')
}
Object.freeze(PagerDutyApi)
module.exports = PagerDutyApi
