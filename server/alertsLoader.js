const io= require('socket.io') 
const axios = require('axios')
const config = require('./configLoader')

// This function sorts alerts by severity 
// critical > warning > info
// then by suppressed/not suppressed
// then alphabetically
const sortAlerts = (items) => 
  items.sort((a,b) => {
    if((a.labels.severity==='critical' && b.labels.severity!=='critical') || 
      (a.labels.severity==='warning' && ['critical','warning'].indexOf(b.labels.severity) < 0)) return -1  
    else if((a.labels.severity===b.labels.severity) && (a.status.state === 'suppressed' && b.status.state !== 'suppressed')) return -1
    else if((a.labels.severity===b.labels.severity) && (a.status.state === b.status.state)) return a.labels.region.localeCompare(b.labels.region)
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


// This function updates alerts counts 
const nonLandscapeCategories = config.categories.filter(c => c.area !== 'landscape')
const updateCounts = (container,alert) => {
  if(alert && alert.labels && alert.labels.severity){
    container.summary = container.summary || {}
    container.summary[alert.labels.severity] = container.summary[alert.labels.severity] || 0
    container.summary[alert.labels.severity] += 1

    if(alert.labels.region){
      container.region = container.region || {}
      container.region[alert.labels.region] = container.region[alert.labels.region] || {}
      container.region[alert.labels.region][alert.labels.severity] = container.region[alert.labels.region][alert.labels.severity] || 0
      container.region[alert.labels.region][alert.labels.severity] += 1
    }
    
    if(alert.status && alert.status.state === 'suppressed') {
      container.summary[`${alert.labels.severity}Silenced`] = container.summary[`${alert.labels.severity}Silenced`] || 0
      container.summary[`${alert.labels.severity}Silenced`] += 1
      
      container.region[alert.labels.region][`${alert.labels.severity}Silenced`] = container.region[alert.labels.region][`${alert.labels.severity}Silenced`] || 0
      container.region[alert.labels.region][`${alert.labels.severity}Silenced`] += 1
    }
  }
}
// END ################################################################


const extendAlerts = (items) => {
  const result = {items, counts: {}, labelValues: {}}

  // load default regions
  config.defaultRegions.forEach(region => {
    result.counts.region = result.counts.region || {}
    result.counts.region[region] = {critical: 0, warning: 0, info: 0, criticalSilenced: 0, warningSilenced: 0, infoSilenced: 0}
  })

  //counts -> category -> NAME -> SEVERITY -> number
  items.forEach(alert => {

    // get all available values fro label filters
    for(let name in alert.labels) {
      if(config.labelFilters.hasOwnProperty(name)) {
        result.labelValues[name] = result.labelValues[name] || []
        if(result.labelValues[name].indexOf(alert.labels[name])<0) {
          result.labelValues[name].push(alert.labels[name])
        }
      }
    }

    // calculate severity counts dependent on categories
    updateCounts(result.counts,alert)
    for(let category of config.categories) {
      result.counts.category = result.counts.category || {}
      updateCounts(result.counts.category)
    
      const itemInCategory = Object.keys(category.match_re).reduce((active, label) => {
        return active && new RegExp(category.match_re[label]).test(alert.labels[label])
      },true)

      result.counts.category[category.name] = result.counts.category[category.name] || {}
      
      if(itemInCategory) {
        updateCounts(result.counts.category[category.name],alert)

        if(category.area === 'landscape') {
          // severity counts for categories dependent on this landscape category
          for(let subCategory of nonLandscapeCategories) {
            result.counts.category[category.name]['category'] = result.counts.category[category.name]['category'] || {}
            result.counts.category[category.name].category[subCategory.name] = result.counts.category[category.name].category[subCategory.name] || {}

            const itemInSubCategory = Object.keys(subCategory.match_re).reduce((active, label) => {
              if(!active) return false
              const regex = new RegExp(subCategory.match_re[label])
              return regex.test(alert.labels[label])
            }, true)

            if(itemInSubCategory) {
              updateCounts(result.counts.category[category.name].category[subCategory.name],alert)
            }
          } 
        }
      }
    }
    // END 
  })
  
  Object.keys(result.labelValues).forEach(k => result.labelValues[k] = result.labelValues[k].sort())

  return result
}

const loadAlerts = async ({cached = false} = {}) => {
  if(cached === true && _cachedAlerts) return {alerts: _cachedAlerts, hasNew: false}

  return axios
    .get(`${process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT}/alerts`)
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
      console.error('ALERTS LOADER API ERROR: ', error.message)
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
  get: async () => loadAlerts({cached: true}).then(result => result ? result.alerts : null) 
}

Object.freeze(AlertsLoader)
module.exports = AlertsLoader
