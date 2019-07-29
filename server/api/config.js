const fs = require('fs')

let clientConfig

const loadClientConfig = async () => {
  if(!clientConfig) {
    const content = fs.readFileSync( __dirname + '/../../config/clientConfig.json', 'utf8')
    clientConfig = JSON.parse(content)
  }
  return clientConfig
}

module.exports = (req, res, next) => {
  loadClientConfig()
    .then(data => res.send(data))
    .catch(err => res.status(500).send(`Could not load client config. ${err}`))
}
