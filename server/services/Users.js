const fs = require("fs"),
  path = require("path"),
  filePath = path.join(__dirname, "/../../config/users/editors.json")

const loadSuperUsers = () => JSON.parse(fs.readFileSync(filePath))
let superUsers = loadSuperUsers()

// This is the fs watch function.
fs.watch(filePath, (event, filename) => {
  if (event === "change") superUsers = loadSuperUsers()
})

const map = (id, attributes = {}) => {
  let user = { ...attributes, id, editor: false }
  if (superUsers[id]) {
    user = Object.assign(user, superUsers[id])
    user.editor = true
  }
  return user
}

const developer = {
  id: "DEV",
  fullName: "User Developer",
  email: "developer@dev.com",
  editor: true,
}

module.exports = {
  map,
  developer,
}
