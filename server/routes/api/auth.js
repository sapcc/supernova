const verifyToken = require("../../middlewares/verifyToken")
const express = require("express")
const router = express.Router()

/**
 * Builds the login URI
 * query params MUST contain
 *  redirectUri
 *  state
 */
https: router.get("/login", async (req, res) => {
  res.send(
    encodeURI(
      `${process.env.OIDC_ENDPOINT}/authorize\
?response_type=id_token\
&client_id=${process.env.OIDC_CLIENT_ID}\
&redirect_uri=${req.query.redirectUri}\
&scope=openid\
&state=${req.query.state}\
&nonce=123456`
    )
  )
})

https: router.get("/profile", verifyToken, async (req, res) => {
  res.send(req.user)
})

module.exports = router
