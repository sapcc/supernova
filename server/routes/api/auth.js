const auth = require("../../middlewares/auth")
const userToken = require('../../helpers/userToken')
const express = require("express")
const Identity = require('../../lib/Identity')
const router = express.Router()

router.get("/profile", auth, async (req, res) => res.send(req.user))
router.post("/login", async (req, res) => {
  Identity.authenticateByPassword(req.body.name,req.body.password)
    .then(user => {
      const token = userToken.generate(user)
      res.cookie('auth_token', token, {
        expires: new Date(Date.now()+4*3600*1000),
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
      }).status(201).send(user)

      //res.header("x-auth-token", token).send(user)
    })
    .catch(error => {console.log(error); res.status(400).send(error)})
})

module.exports = router