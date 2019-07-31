const fs = require('fs')

console.info('CONFIG LOADER: load and parse')
const content = fs.readFileSync( __dirname + '/../config/clientConfig.json', 'utf8')
const config = JSON.parse(content)
console.info('CONFIG LOADER: done!')
module.exports = config
