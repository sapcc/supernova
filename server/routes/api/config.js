const config = require('../../services/configLoader')

module.exports = (req, res, next) => res.send(config)
