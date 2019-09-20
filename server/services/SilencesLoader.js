const utils = require('../helpers/utils')

const AlertManagerApi = require('../lib/AlertManagerApi')

let _cachedSilences = {items: null}

const updateCachedSilences = (silences) => {
  _cachedSilences.items = silences
}

const getCachedSilences = () => (
  { items: _cachedSilences.items }
)

const loadSilences = async (options = {}) => {
  if(options && options.fromCache && _cachedSilences.items !== null) return getCachedSilences()

  return AlertManagerApi.silences()
    .then(silences => {
      console.log(`ALERT MANAGER->SILENCES LOADER [${new Date()}]: receive new silences from API`)
      const newCacheString = JSON.stringify(silences)

      // cache items
      let hasNew = false
      if(!_cachedSilences.cacheString || _cachedSilences.cacheString !== newCacheString) {
        _cachedSilences.cacheString = newCacheString
        updateCachedSilences(silences)
        hasNew = true
      }
      return { hasNew, silences: getCachedSilences()}
    })
    .catch(error => {
      console.error('ALERT MANAGER->SILENCES LOADER API ERROR: ', error.message)
      return null
    })
};

// This function starts periodical the silences loader for Alert Manager.
const start = (onUpdate) => {
  // run loadAlerts every 30 seconds
  utils.doPeriodical(
    {intervalInSeconds: 30, immediate: true}, () => 
    loadSilences({fromCache: false}).then(({hasNew,silences}) => silences && onUpdate(silences))
  )
}

const get = () => 
  loadSilences({fromCache: true}) 
;

const SilencesLoader = {
  start, 
  get
}

Object.freeze(SilencesLoader)
module.exports = SilencesLoader
