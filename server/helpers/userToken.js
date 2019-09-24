const jwt = require("jsonwebtoken")

const generate = (user) => jwt.sign(user, process.env.TOKEN_PRIVATE_KEY) 
const decode = (token) => jwt.verify(token, process.env.TOKEN_PRIVATE_KEY)

module.exports = {
  generate,
  decode
}