const auth = require("../../middlewares/auth")
const express = require("express")
const Alerts= require('../../services/Alerts')
const Silences= require('../../services/Silences')
const router = express.Router()

router.post("/:fingerprint", auth, async (req, res) => {
  // check user credentials
  if(!req.user.editor) return res.status(401).send('Not authorized!') 
  const {duration,comment} = req.body
  if(!comment) throw('Please give a description')

  Alerts.get()
    .then( result => result.alerts.find(a => a.fingerprint === req.params.fingerprint))
    .then(alert => Silences.createSilence({user:req.user,alert,duration,comment}))
    .then(() => res.status(201).send('OK'))
    .catch(error => res.status(500).send(`Silence creation failed! ${error}`))
})


module.exports = router