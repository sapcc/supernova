const axios = require("axios")

const headers = {
  "Content-Type": "application/json",
  Accept: "application/vnd.pagerduty+json;version=2",
  Authorization: `Token token=${process.env.REACT_APP_PAGERDUTY_API_TOKEN}`,
  From: `${process.env.REACT_APP_PAGERDUTY_SERVICE_USER_EMAIL}`,
}

const url = (path) => `${process.env.REACT_APP_PAGERDUTY_API_ENDPOINT}/${path}`

const incidents = async (params = {}) =>
  axios
    .get(url("incidents"), { headers, params })
    .then((response) => (response.data && response.data.incidents) || [])
const incidentAlerts = async (incidentId, params = {}) =>
  axios
    .get(url(`incidents/${incidentId}/alerts`), { headers, params })
    .then((response) => response.data && response.data.alerts)
const incidentNotes = async (incidentId) =>
  axios
    .get(url(`incidents/${incidentId}/notes`), { headers })
    .then((response) => response.data && response.data.notes)
const ackIncident = (incidentId) =>
  axios
    .put(
      url(`incidents/${incidentId}`),
      {
        incident: {
          type: "incident",
          status: "acknowledged",
        },
      },
      { headers }
    )
    .then((response) => response.data && response.data.incident)
const createNote = (incidentId, note) =>
  axios
    .post(
      url(`incidents/${incidentId}/notes`),
      {
        note: {
          content: note,
        },
      },
      { headers }
    )
    .then((response) => response.data.note)

const PagerDutyApi = {
  incidents,
  incidentAlerts,
  incidentNotes,
  ackIncident,
  createNote,
}
Object.freeze(PagerDutyApi)
module.exports = PagerDutyApi
