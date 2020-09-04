const moment = require("moment")
const utils = require("../helpers/utils")
const alertsHelper = require("../helpers/alertsHelper")
const AlertManagerApi = require("../lib/AlertManagerApi")
const PagerDutyApi = require("../lib/PagerDutyApi")

const Cache = require("../lib/Cache")
const _alertsCache = new Cache()
const _acknowledgementsCache = new Cache()
const _updateListeners = []

/**
 * This function adds a listener for alert changes.
 * @param {function} a callback function.
 * @public
 */
const addUpdateListener = (func) => _updateListeners.push(func)

/**
 * This function returns cached values or loads alerts from API.
 * @public
 */
const get = async () => (_alertsCache.loaded() ? _alertsCache.get() : load())

/**
 *  This function acknowledge the incident this alert belogs to in PagerDuty
 * and creates an acknowledge note with user information.
 * @param {function} fingerprint
 * @param {Object} user
 */
const acknowledgeAlert = async (fingerprint, user) => {
  const { alerts } = _alertsCache.get()
  const index = alerts.findIndex((a) => a.fingerprint === fingerprint)
  if (index < 0) throw "Could not find alert"
  const alert = alerts[index]

  if (!alert) throw "Could not find alert"
  if (!alert.status.pagerDutyInfos || !alert.status.pagerDutyInfos.incidentId)
    throw "Alert is not acknowledgeable!"
  const key = alertKey(alert)
  const incidentId = alert.status.pagerDutyInfos.incidentId

  return PagerDutyApi.ackIncident(incidentId).then((incident) =>
    PagerDutyApi.createNote(
      incidentId,
      `Incident was acknowledged on behalf of ${user.email}. (${
        user.fullName
      }) time: ${moment().utc().format("YYYY-MM-DD HH:mm:ss ZZ UTC")}`
    )
      .then((note) => PagerDutyApi.incidentNotes(incidentId))
      .then((notes) => {
        incident.notes = notes

        // add new acknowledgements to cached Acknowledgements
        const hashMap = _acknowledgementsCache.get()
        const acknowledgements = buildAcknowledgements(incident)
        hashMap[key] = { incidentId, acknowledgements }

        // update alerts if any changes
        const hasChanged = _acknowledgementsCache.update(hashMap)
        if (hasChanged) updateAlerts(alerts)
      })
  )
}

/**
 * This function informs all listeners for alert changes.
 * @private
 */
const informUpdateListeners = () =>
  _updateListeners.forEach((listener) => {
    // extend alerts with acknowledgement infos from PagerDuty
    const { alerts, counts, labelValues } = _alertsCache.get()
    listener({ alerts, counts, labelValues })
  })

/**
 * This function sorts and extends alerts, calculates counts and collects label values.
 * If there are alerts in PagerDuty matching with the alerts,
 * then we set a new attribute at the corresponding alerts "pagerDutyInfos".
 * pagerDutyInfos contains at least the incident ID.
 * @param {array} alerts
 * @return {Object} HashMap: alerts, counts and labelValues
 * @private
 */
const updateAlerts = (alerts) => {
  // if alerts provided then extend them otherwise load them from the cache
  if (!alerts) ({ alerts } = _alertsCache.get())

  const acknowledgements = _acknowledgementsCache.get()
  // extend alerts with acknowledgements
  if (acknowledgements) {
    //console.log(Object.keys(acknowledgements))
    alerts = alerts.map((alert) => {
      if (acknowledgements[alertKey(alert)]) {
        alert.status = alert.status || {}
        alert.status.pagerDutyInfos = acknowledgements[alertKey(alert)]
        //console.log(':::::',alertKey(alert),alert.status.pagerDutyInfos)
      }
      return alert
    })
  }
  let counts, labelValues
  ;({ alerts, counts, labelValues } = alertsHelper.extend(alerts))
  alerts = alertsHelper.sort(alerts)
  const hasChanged = _alertsCache.update({ alerts, counts, labelValues })
  if (hasChanged) informUpdateListeners(_alertsCache.get())
  return _alertsCache.get()
}

/**
 * This function loads the alerts from AlertMagnager.
 * and label values, and caches them
 * @return Promise
 * @private
 */
const load = async () => {
  console.log("ALERTS LOADER: request alerts from API")
  return AlertManagerApi.alerts()
    .then((alerts) => {
      console.info(
        `[${moment().format(
          "DD.MM.YYYY HH:mm"
        )}] ALERTS LOADER: receive alerts from alert manager`,
        alerts.length
      )
      return updateAlerts(alerts)
    })
    .catch((error) => {
      console.error(
        `[${moment().format("DD.MM.YYYY HH:mm")}] ALERTS LOADER: api error: `,
        error.message
      )
      return null
    })
}

/**
 * This function loads open and acknowledged alerts from pagerduty.
 * It also enriches alerts with incident and incidents with notes.
 * @private
 * @return {ALERT_PROPS, incident: {INCIDENT_PROPS, notes: []}}
 */
// const loadPagerDutyAlerts = () => PagerDutyApi.incidents({"statuses[]": "acknowledged", "statuses[]": "triggered"})
const loadPagerDutyAlerts = () => {
  const date = new Date()
  // date.setDate(date.getDate() - 1) // one day in the past
  date.setHours(date.getHours() - 9) // hours in the past

  return PagerDutyApi.incidents({
    statuses: ["acknowledged", "triggered"],
    limit: 200,
    since: date,
  })
    .then((incidents) => {
      console.log(
        `[${moment().format(
          "DD.MM.YYYY HH:mm"
        )}] PAGERDUTY LOADER: receive incidents from pagerduty`,
        incidents.length
      )
      // load notes for each incident and add them to incident
      return Promise.all(
        incidents.map((i) =>
          PagerDutyApi.incidentNotes(i.id).then((notes) => {
            i.notes = notes
            return i
          })
        )
      )
    })
    .then((incidents) =>
      // load alerts for each incident and extend each alert with the correspondent incident.
      Promise.all(
        incidents.map((i) =>
          PagerDutyApi.incidentAlerts(i.id).then((alerts) =>
            alerts.map((a) => {
              a.incident = i
              return a
            })
          )
        )
      )
    )
    .then((incidentAlerts) => incidentAlerts.flat()) // incidentAlerts is an array of alert array. So we have to flat it!
    .then((alerts) => {
      console.info(
        `[${moment().format(
          "DD.MM.YYYY HH:mm"
        )}] PAGERDUTY LOADER: receive alerts from pagerduty`,
        alerts.length
      )

      return alerts.reduce((hashMap, alert) => {
        const acknowledgements = buildAcknowledgements(alert.incident)
        hashMap[pagerDutyAlertKey(alert)] = {
          incidentId: alert.incident.id,
          acknowledgements,
        }
        return hashMap
      }, {})
    })
    .then((alertsHashMap) => {
      const hasChanged = _acknowledgementsCache.update(alertsHashMap)
      if (hasChanged) updateAlerts()
    })
    .catch((error) =>
      console.error(
        `[${moment().format("DD.MM.YYYY HH:mm")}] PAGERDUTY LOADER: error: `,
        error.message
      )
    )
}
/**
 * This function extracts acknowledgements and notes from incident and standardizes them.
 * @param {Object} Incident
 * @return {array} List of acknowledgement objects
 * @private
 */
const buildAcknowledgements = (incident) => {
  const result = []
  if (incident.notes) {
    const regex = /Incident was acknowledged on behalf of (.+@.+)\. \(?([^\)]+)?\)?\s*time: (.+)/
    incident.notes.forEach((note) => {
      const found = note.content.match(regex)
      let name = found && found[2]
      let email = found && found[1]
      if (!name && email) {
        // extract name from email
        const nameMatch = email.match(/(.+)\.(.+)@/)
        try {
          if (nameMatch) {
            const firstName = nameMatch[1]
              .split(".")
              .map((n) => utils.capitalize(n))
              .join(" ")
            const lastName = nameMatch[2]
              .split(".")
              .map((n) => utils.capitalize(n))
              .join(" ")
            name = `${firstName} ${lastName}`
          }
        } catch (e) {}
      }
      if (found) result.push({ at: new Date(found[3]), user: { email, name } })
    })
  }
  if (incident.acknowledgements) {
    incident.acknowledgements.forEach((ack) =>
      result.push({
        at: new Date(ack.at),
        user: { name: ack.acknowledger.summary },
      })
    )
  }
  return result
}

/**
 * This function generates a key of an alert from AlertManager based on the labels.
 * @param {Object} (AlertManager) alert
 * @return {string} key
 * @private
 * @todo Replace it by alert fingerprint.
 */
const alertKey = (alert) => {
  const details = alert.labels
  // TODO: remove next line
  if (details.severity === "test") details.severity = "critical"
  return `${details.severity || ""}-${details.service || ""}-${
    details.tier || ""
  }-${details.region || ""}-${details.context || ""}`
}

/**
 * This function generates a key of an alert from PAgerDuty based on the details.
 * @param {Object} (AlertManager) alert
 * @return {string} key
 * @private
 * @todo Replace it by fingerprint provided by alert details.
 */
const pagerDutyAlertKey = (alert) => {
  const details = alert.body.details
  //TODO: add alert name
  //TODO: replace key with alert fingerprint after update of Alert Manager
  return `${alert.severity || ""}-${details.Service || ""}-${
    details.Tier || ""
  }-${details.Region || ""}-${details.Context || ""}`.replace(/\n/g, "")
}

// Run alerts polling every 30 seconds
utils.doPeriodical({ intervalInSeconds: 30, immediate: true }, load)
// Run pagerduty alerts polling every 5 minutes
utils.doPeriodical(
  { intervalInSeconds: 300, immediate: true },
  loadPagerDutyAlerts
)

const Alerts = {
  addUpdateListener,
  get,
  acknowledgeAlert,
}

//Object.freeze(Alerts)
module.exports = Alerts
