const moment = require('moment')
const utils = require('../helpers/utils')
const AlertManagerApi = require('../lib/AlertManagerApi')
const Cache = require('../lib/Cache')

const _silencesCache = new Cache()
const _updateListeners = []
const addUpdateListener = (func) => _updateListeners.push(func)

/**
 * This function informs all listeners for silence changes.
 * @private
 */
const informUpdateListeners = () => _updateListeners.forEach(listener => {
  listener(_silencesCache.get())
})

/**
 * This function returns cached values or loads silences from API.
 * @public
 */
const get = async () => _silencesCache.loaded() ? _silencesCache.get() : load()

/**
 * This function sorts asilences in the cache and informs all listeners.
 * @param {array} alerts 
 * @return {Object} HashMap: alerts, counts and labelValues
 * @private
 */
const updateSilences = (silences) => {
  const hasChanged = _silencesCache.update(silences)
  if(hasChanged) informUpdateListeners(_silencesCache.get())
  return _silencesCache.get()
}

/**
 * This function loads the sileneces from AlertMagnager.
 * @return {Promise} a promise object
 * @private
 */
const load = () => AlertManagerApi.silences()
  .then(silences => {
    console.info(`[${moment().format('DD.MM.YYYY hh:mm')}] SILENCES LOADER: receive silences from alert manager`, silences.length)
    return updateSilences(silences)
  })
  .catch(error => {
    console.error(`[${moment().format('DD.MM.YYYY hh:mm')}] SILENCES LOADER: api error: `, error.message)
    return null
  })
;  

// Run silences polling every 5 minutes
utils.doPeriodical({intervalInSeconds: 300, immediate: true}, load)

module.exports = Silences = {
  addUpdateListener,
  get
}