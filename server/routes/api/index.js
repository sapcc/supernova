const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use('/auth', require('./auth'))
router.use('/alerts', require('./alerts'))
router.use('/silences', require('./silences'))
router.use('/support', require('./support'))

module.exports = router
