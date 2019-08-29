const io= require('socket.io') 
const axios = require('axios')
const config = require('./configLoader')

let _cachedItems
let _cacheString 

const hasNewItems = (items) => {
  const newCacheString = JSON.stringify(items)
  
  if(!_cacheString || _cacheString !== newCacheString) {
    _cacheString = newCacheString
    return true
  }
  return false
}


const loadItems = async ({cached = false} = {}) => {
  if(cached === true && _cachedItems) return {items: _cachedItems, hasNew: false}

  return axios
    .get(`${process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT}/silences`)
    .then(response => response.data)
    .then(items => {
      const hasNew = hasNewItems(items)
      if(hasNew) {_cachedItems = items}
      return { items: _cachedItems, hasNew}
    })
    .catch(error => {
      console.error('SILENCES LOADER API ERROR: ', error)
      return null
    })
}

const _onUpdateCallbacks = []

const onUpdate = (fn) => _onUpdateCallbacks.push(fn)

const start = (intervalInSeconds = 300, immediate = true) => {
  if(!intervalInSeconds || intervalInSeconds < 20) intervalInSeconds = 300
  let interval = intervalInSeconds * 1000

  const periodicalLoad = () => {
    let start = Date.now()
    loadItems().then(result => {
      if(result && result.hasNew) _onUpdateCallbacks.forEach(fn => fn(result.alerts))
      console.log(`SILENCES LOADER [${new Date()}]: receive new silences from API`)
    })

    let timeout = start + interval - Date.now()
    if(timeout < 0) timeout = 0
    return setTimeout(periodicalLoad, timeout)
  }

  return setTimeout(periodicalLoad, immediate ? 0 : interval)
}


const SilencesLoader = {
  start, 
  onUpdate,
  get: async () => loadItems({cached: true}) 
}

Object.freeze(SilencesLoader)
module.exports = SilencesLoader
