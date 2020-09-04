const verifyToken = require("../../middlewares/verifyToken")
const express = require("express")
const Alerts = require("../../services/Alerts")
const router = express.Router()

router.put("/:fingerprint/ack", verifyToken, async (req, res) => {
  // check user credentials
  if (!req.user.editor) return res.status(401).send("Not authorized!")

  Alerts.acknowledgeAlert(req.params.fingerprint, req.user)
    .then(() => res.status(200).send("OK"))
    .catch((error) => {
      console.error(error)
      res.status(500).send(`Acknowledgement failed! ${error}`)
    })
})

module.exports = router
