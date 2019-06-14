const fs = require('fs')

let filters

const loadFilters = async () => {
  if(!filters) {
    const content = fs.readFileSync( __dirname + '/../../config/filters/default.json', 'utf8')
    filters = JSON.parse(content)
  }
  return filters
}

module.exports = (req, res, next) => {
  loadFilters()
    .then(data => res.send(data))
    .catch(err => res.status(500).send(`Could not load filters. ${err}`))
}
