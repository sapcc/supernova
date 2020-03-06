const YAML = require('yaml')
const fs = require('fs')
const path = require('path')


const contactYaml = fs.readFileSync(path.join(__dirname, '/../../config/support/incident_contact_list.yaml'))

const getContacts = async () => {
    try {
        const contactList = YAML.parse(contactYaml.toString())
        return contactList
    } catch (error) {
        throw error
    }   
}

const Support = {
    getContacts
}

module.exports = Support