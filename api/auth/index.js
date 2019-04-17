const crypto = require('crypto')
const router = require('express').Router()

router.get('/token', (req,res) => {
  // create a timestamp between now + 1 minute and now + 2 hours in seconds
  const timestamp = Math.floor(Date.now()/1000+Math.random()*60*59*2+60)
  // create signature using client credentials
  const signature = crypto.createHmac('sha256', process.env.BLACKHOLE_API_SECRET)
                          .update(`${timestamp}`)
                          .digest('base64')

  res.send(`${process.env.BLACKHOLE_API_KEY}.${signature}.${timestamp}`)
})

module.exports = router
