const auth = require("../../middlewares/auth")
const express = require("express")
const AlertsLoader= require('../../services/AlertsLoader')
const PagerDutyApi = require('../../lib/PagerDutyApi')
const alertsHelper = require('../../services/alertsHelper')
const router = express.Router()
const moment = require('moment')

router.put("/:fingerprint/ack", auth, async (req, res) => {
  //res.send(req.user)
  // find alert and get key based on labels
  // TODO: replace labels with fingerprint
  const alertKey = await AlertsLoader.get()
    .then(alerts => alerts.items.find(a => a.fingerprint === req.params.fingerprint)) // find alert based on fingerprint
    .then(alert => alertsHelper.alertKey(alert)) // build alert key 
    .then(alertKey => 
      PagerDutyApi.triggeredAlerts() // load alerts from pagerduty
        .then(alerts => alerts.find(a => alertsHelper.pagerDutyAlertKey(a) === alertKey)) // find alert based on alertKey
        .then(pagerDutyAlert => {// return incident id
          if(!pagerDutyAlert || !pagerDutyAlert.incident) throw('Could not find Alert in PagerDuty')
          return pagerDutyAlert.incident.id
        }) 
    ).then(incidentId => 
      //PagerDutyApi.ackIncident(incidentId).then( () => incidentId) // acknowledge incident
      incidentId
    ).then(incidentId => // create a note with current acknowledger
      PagerDutyApi.createNote(incidentId, {
        "note": {
          "content": `Incident was acknowledged on behalf of ${req.user.email}. (${req.user.fullName}) time: ${moment().utc().format('YYYY-MM-DD HH:mm:ss ZZ UTC')}`
        }
      })
    ).then( () => {
      res.status(200).send('OK')
    })
    .catch(error => {
      console.error(':::::::::ERROR:',error)
      res.status(500).send(`Acknowledgement failed! ${error}`)
    })
})

module.exports = router