// const fs = require("fs"),
//   path = require("path"),
//   incidentContactListfilePath = path.join(
//     __dirname,
//     `/../../config/support/incident_contact_list.json${
//       process.env.NODE_ENV === "test" ? ".sample" : ""
//     }`
//   )
// silenceTemplatesfilePath = path.join(
//   __dirname,
//   `/../../config/support/silence_templates.json${
//     process.env.NODE_ENV === "test" ? ".sample" : ""
//   }`
// )

// const loadContactList = () =>
//   JSON.parse(fs.readFileSync(incidentContactListfilePath))
// let contactList = loadContactList()

// // This is the fs watch function.
// fs.watch(incidentContactListfilePath, (event, _) => {
//   if (event === "change") contactList = loadContactList()
// })

// const getContacts = async () => contactList

// const loadSilenceTemplates = () =>
//   JSON.parse(fs.readFileSync(silenceTemplatesfilePath))
// let silenceTemplates = loadSilenceTemplates()

// // This is the fs watch function.
// fs.watch(silenceTemplatesfilePath, (event, _) => {
//   if (event === "change") silenceTemplates = loadSilenceTemplates()
// })

// const getSilenceTemplates = async () => silenceTemplates

// const Support = {
//   getContacts,
//   getSilenceTemplates,
// }

// module.exports = Support

const fs = require("fs"),
  path = require("path")

const supportFiles = ["incident_contact_list", "silence_templates"]
const data = {}

if (fs.existsSync(filePath)) {
  const loadData = (filePath) => {
    try {
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

    fs.watch(filePath, (event, _) => {
      if (event === "change") data[file] = loadData(filePath)
    })

    data[file] = loadData(filePath)
  })
}

const Support = {
  getContacts: async () => data["incident_contact_list"],
  getSilenceTemplates: async () => data["silence_templates"],
}

module.exports = Support
