const io= require('socket.io') 
const axios = require('axios')
const fs = require('fs')

let config = JSON.parse(fs.readFileSync( __dirname + '/../config/clientConfig.json', 'utf8'))

// This function sorts alerts by severity 
// critical > warning > info ...
const sortAlerts = (items) => 
  items.sort((a,b) => {
    if((a.labels.severity==='critical' && b.labels.severity!=='critical') || 
      (a.labels.severity==='warning' && ['critical','warning'].indexOf(b.labels.severity) < 0)) return -1  
    else if(a.labels.severity===b.labels.severity) return a.labels.region.localeCompare(b.labels.region)
    else return 1
  })
;

let _cachedAlerts
let _cacheString 

const hasNewAlerts = (items) => {
  const newCacheString = JSON.stringify(items)
  
  if(!_cacheString || _cacheString !== newCacheString) {
    _cacheString = newCacheString
    return true
  }
  return false
}

const extendAlerts = (items) => {
  const result = {items, counts: {}, labelValues: {}}
  //counts -> category -> NAME -> SEVERITY -> number
  items.forEach(alert => {
    if(alert.labels.region) {
      result.counts['region'] = result.counts['region'] || {}
      result.counts['region'][alert.labels.region] = result.counts['region'][alert.labels.region] || 0
      result.counts['region'][alert.labels.region] += 1
    }

    for(let category of config.categories) {

      const itemIsInCategory = Object.keys(category.match_re).reduce((active, label) => {
        if(!active) return false
        const regex = new RegExp(category.match_re[label])
        return regex.test(alert.labels[label])
      }, true)

      if(itemIsInCategory) {
        result.counts['category'] = result.counts['category'] || {}
        result.counts.category[category.name] = result.counts.category[category.name] || {}
        result.counts.category[category.name][alert.labels.severity] = result.counts.category[category.name][alert.labels.severity] || 0
        result.counts.category[category.name][alert.labels.severity] += 1 
      }
    } 
  })

  return result
}

const loadAlerts = async ({cached = false} = {}) => {
  if(cached === true && _cachedAlerts) return {alerts: _cachedAlerts, hasNew: false}

  return axios
    .get(process.env.ALERTS_API_ENDPOINT)
    .then(response => response.data)
    .then(items => sortAlerts(items))
    .then(items => {
      const hasNew = hasNewAlerts(items)
      if(hasNew) {
        _cachedAlerts = extendAlerts(items)
      }
      return { alerts: _cachedAlerts, hasNew}
    })
    .catch(error => {
      console.error('ALERTS LOADER API ERROR: ', error)
      return null
    })
}

const _onUpdateCallbacks = []

const onUpdate = (fn) => _onUpdateCallbacks.push(fn)

const start = (intervalInSeconds = 30, immediate = true) => {
  if(!intervalInSeconds || intervalInSeconds < 20) intervalInSeconds = 30
  let interval = intervalInSeconds * 1000

  const periodicalLoad = () => {
    let start = Date.now()
    loadAlerts().then(result => {
      if(result && result.hasNew) _onUpdateCallbacks.forEach(fn => fn(result.alerts))
      console.log(`ALERTS LOADER [${new Date()}]: receive new alerts from API`)
    })

    let timeout = start + interval - Date.now()
    if(timeout < 0) timeout = 0
    return setTimeout(periodicalLoad, timeout)
  }

  return setTimeout(periodicalLoad, immediate ? 0 : interval)
}


const AlertsLoader = {
  start, 
  onUpdate,
  get: async () => loadAlerts({cached: true}).then(result => result.alerts) 
}

Object.freeze(AlertsLoader)
module.exports = AlertsLoader
