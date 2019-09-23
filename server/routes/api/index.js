const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use('/auth', require('./auth'))

module.exports = router
