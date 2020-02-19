const auth = require("../../middlewares/auth")
const express = require("express")
const Alerts= require('../../services/Alerts')
const router = express.Router()

router.get("/contacts", auth, async (req, res) => {
   
  Alerts.get()
    .then( result => result.alerts.find(a => a.fingerprint === req.params.fingerprint))
    .then(alert => Silences.createSilence({user:req.user,alert,duration,comment}))
    .then(() => res.status(201).send('OK'))
    .catch(error => res.status(500).send(`Silence creation failed! ${error}`))
})


module.exports = router