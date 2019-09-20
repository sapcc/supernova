const jwt = require("jsonwebtoken")
const Identity = require('../lib/Identity')
const validIssuer = ["CN=SSO_CA,O=SAP-AG,C=DE","CN=SAP SSO CA G2,O=SAP SE,L=Walldorf,C=DE"]

module.exports = async (req, res, next) => {
  //get the token from the header if present
  const token = req.headers["x-access-token"] || req.headers["authorization"]
  //if no token found, return response (without going to the next middelware)
  if (!token) {
    // try to validate SSO
    const sslVerify = (req.header('ssl-client-verify') || '').toUpperCase()
    const issuer = req.header('ssl-client-issuer-dn')

    if(sslVerify === 'SUCCESS' && validIssuer.indexOf(issuer) >= 0) {
      try {
        req.user= await Identity.getUserData(req.header('x-remote-user'))
        return next()
      } catch(err) {}
    } 
    return res.status(401).send("Access denied. No token provided.")
  }
  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, process.env.SECRET)
    req.user = decoded
    next()
  } catch (ex) {
    //if invalid token
    res.status(400).send("Invalid token.")
  }
}