const fs = require('fs')

let categories

const loadCategories = async () => {
  if (categories) return categories
  
  const content = fs.readFileSync( __dirname + '/../../config/categories.json', 'utf8')
  return categories = JSON.parse(content)
}

module.exports = (req, res, next) => {
  loadCategories()
    .then(data => res.send(data))
    .catch(err => res.status(500).send(`Could not load categories. ${err}`))
}
