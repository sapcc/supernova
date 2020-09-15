const verifyToken = require("../../middlewares/verifyToken")
const express = require("express")
const Alerts = require("../../services/Alerts")
const Silences = require("../../services/Silences")
const router = express.Router()

router.post("/", verifyToken, (req, res) => {
  if (!req.user.editor) return res.status(401).send("Not authorized!")
  const { matchers, startsAt, endsAt, comment } = req.body

  Silences.createSilence({
    matchers,
    startsAt,
    endsAt,
    comment,
    createdBy: req.user.id,
  })
    .then(() => res.status(201).send("OK"))
    .catch((error) => res.status(500).send(`Silence creation failed! ${error}`))
})

router.post("/alert/:fingerprint", verifyToken, async (req, res) => {
  // check user credentials
  if (!req.user.editor) return res.status(401).send("Not authorized!")
  const { duration, comment } = req.body
  if (!comment) throw "Please give a description"

  Alerts.get()
    .then((result) =>
      result.alerts.find((a) => a.fingerprint === req.params.fingerprint)
    )
    .then((alert) =>
      Silences.createAlertSilence({ user: req.user, alert, duration, comment })
    )
    .then(() => res.status(201).send("OK"))
    .catch((error) => res.status(500).send(`Silence creation failed! ${error}`))
})

module.exports = router
