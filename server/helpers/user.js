const superUsers = require('../../config/editors.json')

const map = (id, attributes = {}) => {
  let user = {...attributes, id, editor: false}
  if(superUsers[id]) {
    user = Object.assign(user, superUsers[id])
    user.editor = true
  }
  return user
}

const developer = {id: "DEV", fullName: "Developer", editor: true}

module.exports = {
  map,
  developer
}