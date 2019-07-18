const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use('/categories', require('./categories'))
router.use('/filters', require('./filters'))

module.exports = router
