const fs = require("fs"),
  path = require("path")

const supportFiles = ["incident_contact_list", "silence_templates"]
const data = {}

const loadData = (filePath) => {
  try {
    console.log("Loading support file: ", filePath)
    return JSON.parse(fs.readFileSync(filePath))
  } catch (e) {
    throw e
  }
}

supportFiles.forEach((file) => {
  const filePath = path.join(
    __dirname,
    `/../../config/support/${file}.json${
      process.env.NODE_ENV === "test" ? ".sample" : ""
    }`
  )

  if (fs.existsSync(filePath)) {
    data[file] = loadData(filePath)
  }
})

const Support = {
  getContacts: async () => data["incident_contact_list"],
  getSilenceTemplates: async () => data["silence_templates"],
}

module.exports = Support
