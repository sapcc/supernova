const fs = require("fs"),
  chokidar = require("chokidar"),
  path = require("path"),
  filePath = path.join(
    __dirname,
    `/../../config/users/editors.json${
      process.env.NODE_ENV === "test" ? ".sample" : ""
    }`
  )

const loadSuperUsers = () => JSON.parse(fs.readFileSync(filePath))
let superUsers = loadSuperUsers()

// This is the chokidar watch function.
chokidar.watch(filePath).on("change", (path) => {
  // console.log("====================", path)
  superUsers = loadSuperUsers()
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
