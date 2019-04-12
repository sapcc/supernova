var express = require('express')
var router = express.Router()

router.use('/', require('./authToken'));

module.exports = router;
