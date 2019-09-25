const ldap = require('ldapjs');
const url = process.env.LDAP_ENDPOINT
const base = process.env.LDAP_BASE
const admin = process.env.LDAP_SERVICE_USER
const secret = process.env.LDAP_SERVICE_PASSWORD

console.log(':::::::::::::',url,base,admin,secret)
const mapUser = (data = {}) => {
  return {
    id: data.name,
    fullName: `${data.givenName} ${data.sn}`,
    email: data.mail,
    groups: (data.memberOf || []).map(g => g.replace(/CN=([^,]+).*/, "$1")).sort()
  }
}

const authenticateByPassword = (userId, password) => {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({url, timeout: 1000, connectTimeout: 1000})
    try {
      client.bind(`CN=${userId},${base}`, password, (err, res, next) => {
        if (err) return reject(err)
        client.unbind()
        resolve(getUserData(userId))
      })
    } catch(err) {resolve(null)}
  })
}

const getUserData = (userId) => {
  return new Promise((resolve,reject) => {
    const client = ldap.createClient({url})
    client.bind(`CN=${admin},${base}`, secret, (err,res) => {
      if(err) return reject(err)
      client.search(base,{filter: `cn=${userId}`, scope: 'sub'}, (err,res) => {
        res.on('error', (err) => reject(err))
        res.on('searchEntry', entry => {
          resolve(mapUser(entry.object))
          client.unbind()
        })
        //res.on('end', () => {console.log(':::::END::::'); client.unbind()} )
      })
    })
  })
}

module.exports = {
  getUserData,
  authenticateByPassword
}
