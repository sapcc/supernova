const userToken = require('../helpers/userToken')
const Identity = require('../lib/Identity')
const validIssuer = ["CN=SSO_CA,O=SAP-AG,C=DE","CN=SAP SSO CA G2,O=SAP SE,L=Walldorf,C=DE"]

const validateAuthToken = (req) => 
  new Promise((resolve,reject) => {
    //get the token from the header if present
    const token = req.cookies.auth_token
    if (!token) reject('Invalid token.')
    try {
      resolve(userToken.decode(token))
    } catch (ex) {
      reject(ex)
    }
  })

const validateSso = (req) => 
  new Promise((resolve,reject) => {
    const sslVerify = (req.header('ssl-client-verify') || '').toUpperCase()
    const issuer = req.header('ssl-client-issuer-dn')

    // check ssl env variables provided by ingress
    if(sslVerify === 'SUCCESS' && validIssuer.indexOf(issuer) >= 0) {
      resolve(Identity.getUserData(req.header('x-remote-user')))
    } 
    reject('SSO failed')
  })


module.exports = async (req, res, next) => {
  //get the token from the header if present
  validateAuthToken(req)
    .then(user => {
      req.user = user
      next()
    }).catch(error => {
      validateSso(req)
        .then(user => {
          req.user= user
          next()
        })
        .catch(error => res.status(401).send("Access denied. No token provided."))
    })
}
