const superUsers = require('../../config/users/editors.json')

const map = (id, attributes = {}) => {
  let user = {...attributes, id, editor: false}
  if(superUsers[id]) {
    user = Object.assign(user, superUsers[id])
    user.editor = true
  }
  return user
}

const developer = {id: "DEV", fullName: "User Developer", email: 'developer@dev.com', editor: true}

module.exports = {
  map,
  developer
}