const verifyToken = require("../../middlewares/verifyToken")
const express = require("express")
const Support = require("../../services/Support")
const router = express.Router()

router.get("/contacts", verifyToken, async (req, res) => {
  Support.getContacts()
    .then((result) => res.status(200).json(result))
    .catch((error) =>
      res
        .status(500)
        .send(
          `The following error occurred while fetching/parsing the contacts list: ${error.message}`
        )
    )
})

router.get("/silence-templates", verifyToken, async (req, res) => {
  Support.getSilenceTemplates()
    .then((result) => res.status(200).json(result))
    .catch((error) =>
      res
        .status(500)
        .send(
          `The following error occurred while fetching/parsing the silence templates: ${error.message}`
        )
    )
})

module.exports = router
