//const config = require('./configLoader')

const utils = require('./utils')
const alertsHelper = require('./alertsHelper')

const AlertManagerApi = require('./AlertManagerApi')
const PagerDutyApi = require('./PagerDutyApi')

let _cachedAlerts = { items: null, counts: {}, labelValues: {} }
let _cachedAcknowledgements = {}


// Convert acknowledgements array to a hash and 
// cache them.
const updateCachedAcknowledgements = (alerts) => {
  const items = alerts.reduce((hash,alert) => {
    const details = alert.body.details
    //TODO: add alert name
    //TODO: replace key with alert fingerprint after update of Alert Manager
    const key = `${alert.severity}-${details.Service}-${details.Tier}-${details.Region}-${details.Context}`.replace(/\n/g,'')
    hash[key] = alert.incident.acknowledgements
    return hash
  },{})
  _cachedAcknowledgements.items = items
}

// Returns acknowledgements for an alert or undefined
const getAlertAcknowledgements = (alert) => {
  if(!_cachedAcknowledgements.items) return null

  const details = alert.labels
  const key = `${details.severity}-${details.service}-${details.tier}-${details.region}-${details.context}`
  return _cachedAcknowledgements.items[key]
}

// Returns current cached alerts ({items,counts,labelValues})
const getCachedAlerts = () => (
  {
    items: _cachedAlerts.items,
    counts: _cachedAlerts.counts,
    labelValues: _cachedAlerts.labelValues
  }
)

// Extend alerts withth acknowledgements and counts and label values.
const updateCachedAlerts = (alerts) => {
  // acknowledgements
  alerts = alerts.map(a => {
    const acknowledgements = getAlertAcknowledgements(a)
    if(acknowledgements) a.status.acknowledgements = acknowledgements
    return a
  })
  // end acknowledgements

  alerts = alertsHelper.sort(alerts)
  const {items,counts,labelValues}  = alertsHelper.extend(alerts)
  _cachedAlerts = {..._cachedAlerts, items, counts, labelValues}
}

// This function loads alerts from Alert Manager and caches them.
const loadAlerts = () => 
  AlertManagerApi.alerts()
    .then(alerts => {
      console.log(`ALERT MANAGER->ALERTS LOADER [${new Date()}]: receive new alerts from API`)

      const newCacheString = JSON.stringify(alerts)
      let hasNew = false
      // cache alerts
      if(!_cachedAlerts.cacheString || _cachedAlerts.cacheString !== newCacheString) {
        _cachedAlerts.cacheString = newCacheString
        updateCachedAlerts(alerts)
        hasNew = true
      }
      return { hasNew, alerts: getCachedAlerts() }
    }) 
    .catch(error => {
      console.error('ALERT MANAGER->ALERTS LOADER API ERROR: ', error.message)
      return null
    })
;

// This function loads acknoledge alerts from Pager Duty and caches them.
const loadAcknowledgements = () => {
  PagerDutyApi.acknowledgedAlerts()
    .then(alerts => {
      console.log(`PAGER DUTY->ALERTS LOADER [${new Date()}]: receive new alerts from API`)

      const newCacheString = JSON.stringify(alerts)

      // cache acknowledgements
      if(!_cachedAcknowledgements.cacheString || _cachedAcknowledgements.cacheString !== newCacheString) {
        _cachedAcknowledgements.cacheString = newCacheString
        updateCachedAcknowledgements(alerts)
      }
    }) 
    .catch(error => {
      console.error('PAGER DUTY->ALERTS LOADER API ERROR: ', error.message)
    })
}

// This function starts periodical the alert loader for Alert Manager and Pager Duty.
const start = (onUpdate) => {
  // run loadAcknowledgements every 5 minutes
  utils.doPeriodical({intervalInSeconds: 300, immediate: true}, loadAcknowledgements)

  // run loadAlerts every 30 seconds
  utils.doPeriodical(
    {intervalInSeconds: 30, immediate: true}, () => 
      loadAlerts().then( ({hasNew,alerts}) => hasNew && onUpdate(alerts) )
  )
}

const get = () => 
  _cachedAlerts.items !== null  ? Promise.resolve(getCachedAlerts()) : loadAlerts() 
;

const AlertsLoader = {
  start, 
  get 
}

Object.freeze(AlertsLoader)
module.exports = AlertsLoader
