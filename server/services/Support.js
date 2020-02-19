const YAML = require('yaml')
const fs = require('fs')
const path = require('path')
const contactListFilePath = path.join(__dirname,'/../../config/support/')

const getContacts = () => {
    const contactYaml = fs.readFileSync(path.join(contactListFilePath, 'incident_contact_list.yaml'))
    const contactList = YAML.parse(contactYaml)
    
    return contactList
}

const Alerts = {
    getContacts
}

//Object.freeze(Alerts)
module.exports = Support