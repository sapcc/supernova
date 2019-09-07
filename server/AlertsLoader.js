//const config = require('./configLoader')

const utils = require('./utils')
const alertsHelper = require('./alertsHelper')

const AlertManagerApi = require('./AlertManagerApi')
const PagerDutyApi = require('./PagerDutyApi')

let _cachedAlerts = { items: null, counts: {}, labelValues: {} }
let _cachedAcknowledgements = {}


// add activeknowledge infos to acked alerts -> 
// loop through alerts and add acked
const updateCachedAcknowledgements = (alerts) => {
  const items = alerts.reduce((hash,alert) => {
    const details = alert.body.details
    //TODO: add alert name
    const key = `${alert.severity}-${details.Service}-${details.Tier}-${details.Region}-${details.Context}`
    hash[key] = alert.incident.acknowledgements
    return hash
  },{})
  _cachedAcknowledgements.items = items
}

const getAlertAcknowledgements = (alert) => {
  const details = alert.labels
  const key = `${details.severity}-${details.service}-${details.tier}-${details.region}-${details.context}`
  return _cachedAcknowledgements.items[key]
}

const getCachedAlerts = () => (
  {
    items: _cachedAlerts.items,
    counts: _cachedAlerts.counts,
    labelValues: _cachedAlerts.labelValues
  }
)

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

const loadAlerts = (onUpdate) => 
  AlertManagerApi.alerts()
    .then(alerts => {
      console.log(`ALERT MANAGER->ALERTS LOADER [${new Date()}]: receive new alerts from API`)

      const newCacheString = JSON.stringify(alerts)
  
      if(!_cachedAlerts.cacheString || _cachedAlerts.cacheString !== newCacheString) {
        _cachedAlerts.cacheString = newCacheString
        updateCachedAlerts(alerts)
      }
    }) 
    .then(() => getCachedAlerts())
    .catch(error => {
      console.error('ALERT MANAGER->ALERTS LOADER API ERROR: ', error.message)
      return null
    })
;

const loadAcknowledgements = () => {
  PagerDutyApi.acknowledgedAlerts()
    .then(alerts => {
      console.log(`PAGER DUTY->ALERTS LOADER [${new Date()}]: receive new alerts from API`)

      const newCacheString = JSON.stringify(alerts)
  
      if(!_cachedAcknowledgements.cacheString || _cachedAcknowledgements.cacheString !== newCacheString) {
        _cachedAcknowledgements.cacheString = newCacheString
        updateCachedAcknowledgements(alerts)
      }
    }) 
    .catch(error => {
      console.error('PAGER DUTY->ALERTS LOADER API ERROR: ', error.message)
    })
}

const start = (onUpdate) => {
  utils.doPeriodical(
    {intervalInSeconds: 30, immediate: true}, 
    () => loadAlerts().then(alerts => alerts ? onUpdate(alerts) : null)
  )
  utils.doPeriodical({intervalInSeconds: 300, immediate: true}, loadAcknowledgements)
}

const get = () => 
  _cachedAlerts.items ? Promise.resolve(getCachedAlerts()) : loadAlerts() 
;

const AlertsLoader = {
  start, 
  get 
}

Object.freeze(AlertsLoader)
module.exports = AlertsLoader
