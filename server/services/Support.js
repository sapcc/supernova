const fs = require("fs"),
  path = require("path"),
  filePath = path.join(
    __dirname,
    `/../../config/support/incident_contact_list.json${
      process.env.NODE_ENV === "test" ? ".sample" : ""
    }`
  )

const loadContactList = () => {
  let json = {}
  try {
    json = JSON.parse(fs.readFileSync(filePath))
  } catch (e) {
    console.error("ERROR")
  }
  return json
}
let contactList = loadContactList()

// This is the fs watch function.
if (fs.existsSync(filePath)) {
  fs.watch(filePath, (event, _) => {
    if (event === "change") contactList = loadContactList()
  })
}

const getContacts = async () => contactList

const Support = {
  getContacts,
}

module.exports = Support
