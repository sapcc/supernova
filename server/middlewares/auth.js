const userHelper = require('../helpers/user')

module.exports = (req,res,next) => {
  // Only for tests
  //return res.send(401, 'missing authorization header')
  if (process.env.NODE_ENV !== 'production') {
    req.user = userHelper.developer
    return next()
  }

  // Check SSO
  if(!req.header('ssl-client-verify') || req.header('ssl-client-verify').toUpperCase() !== 'SUCCESS') {
    res.sendStatus(401)
  } else {
    req.user = userHelper.map(req.header('x-remote-user'))
    next()
  }
}