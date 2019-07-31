const config = require('../configLoader')

module.exports = (req, res, next) => res.send(config)
