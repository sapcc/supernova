const auth = require("../../middlewares/auth")
const express = require("express")
const Alerts= require('../../services/Silences')
const AlertManagerApi = require('../../lib/AlertManagerApi')
const router = express.Router()

router.post("/:fingerprint", auth, async (req, res) => {
  /*Alerts.acknowledgeAlert(req.params.fingerprint,req.user)
    .then(() => res.status(200).send('OK'))
    .catch(error => {
      console.error(error)
      res.status(500).send(`Acknowledgement failed! ${error}`)
    })
  */
  res.send(200)  
})


module.exports = router