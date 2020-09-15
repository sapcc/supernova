/** @module verifyToken
 * verify id token and extract user data
 */
const fetch = require("node-fetch")
const jose = require("node-jose")

class IDToken {
  constructor(jwt) {
    this.jwt = jwt
    try {
      const [header, payload, signature] = jwt.split(".")
      let headerBuffer = new Buffer(header, "base64")
      let payloadBuffer = new Buffer(payload, "base64")

      this.headerData = JSON.parse(headerBuffer.toString("ascii"))
      this.payloadData = JSON.parse(payloadBuffer.toString("ascii"))
      this.signature = signature
    } catch (e) {}
  }

  /**
   * @function verfiy
   * This function uses the jose lib to verify token signature.
   * It also cheks the aud, iss and exp validaty!
   * @return {Promise}
   */
  async verify() {
    if (!this.jwt || this.jwt === "undefined") return false

    // get json web key set (jwts). It contains the public key used to
    // verify the signature. jwts can be reached under a special url definied
    // in the provider's configuration.
    // Flow:
    //   1. request /.well-known/openid-configuration to get the jwks url
    //   2. request the jwks url to get the public key
    if (!IDToken.jwks) {
      IDToken.jwks = await fetch(
        `${this.payloadData.iss}/.well-known/openid-configuration`
      )
        .then((response) => response.json())
        .then((data) => fetch(data.jwks_uri))
        .then((res) => res.json())
        .then((data) => data.keys)
    }

    // convert jwks to jose store and verify the signature
    let keystore = await jose.JWK.asKeyStore(IDToken.jwks)
    const verifier = jose.JWS.createVerify(keystore)
    const verified = await verifier.verify(this.jwt).catch(() => {})
    let isVerified = !!verified

    // verify also the aud, iss and exp
    // iss (Issuer) should be the same like the provider endpoint
    // aud (Audience) should be equal to the client id
    // exp (Expiration Time) schould be greater than now
    isVerified =
      isVerified &&
      this.payloadData.aud === process.env.OIDC_CLIENT_ID &&
      this.payloadData.exp >= Date.now() / 1000 &&
      process.env.OIDC_ENDPOINT.indexOf(this.payloadData.iss) === 0

    return isVerified
  }

  /**
   * @function isEditor
   * User has the editor role if he belongs to special CAM groups.
   * @return {boolean}
   */
  isEditor() {
    return this.payloadData.groups.some((group) => {
      return (
        [
          "CCADMIN_NETWORK_SUPPORT",
          "CCADMIN_STORAGE_SUPPORT",
          "MONSOON3_API_SUPPORT",
          "CCADMIN_API_SUPPORT",
          "CCADMIN_COMPUTE_SUPPORT",
        ].indexOf(group) >= 0
      )
    })
  }

  /**
   * @function user
   * @return {Object} user
   */
  user() {
    return {
      id: this.payloadData.sub,
      fullName: `${this.payloadData.first_name} ${this.payloadData.last_name}`,
      email: this.payloadData.mail,
      editor: this.isEditor(),
    }
  }
}

/**
 * This express middleware verifies the token and stores user in request
 * to be used in further middlewares.
 *
 */
module.exports = function verifyToken(req, res, next) {
  // get id token from request header
  const bearerHeader = req.headers["authorization"]
  const bearer = bearerHeader && bearerHeader.split(" ")
  const bearerToken = bearer && bearer[1]

  // create a new instance of IdToken
  const token = new IDToken(bearerToken)
  // verify token
  token.verify().then((valid) => {
    if (valid) {
      // store user in req
      req.user = token.user()
      next()
    } else res.sendStatus(403)
  })
}
