const auth = require("../../middlewares/auth")
const express = require("express")
const router = express.Router()

router.get("/profile", auth, async (req, res) => res.send(req.user))

module.exports = router