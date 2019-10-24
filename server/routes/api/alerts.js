const auth = require("../../middlewares/auth")
const express = require("express")
const Alerts= require('../../services/Alerts')
const PagerDutyApi = require('../../lib/PagerDutyApi')
// const alertsHelper = require('../../services/alertsHelper')
const router = express.Router()
const moment = require('moment')

router.put("/:fingerprint/ack", auth, async (req, res) => {
  Alerts.acknowledgeAlert(req.params.fingerprint,req.user)
    .then(() => res.status(200).send('OK'))
    .catch(error => {
      console.error(error)
      res.status(500).send(`Acknowledgement failed! ${error}`)
    })
})

module.exports = router