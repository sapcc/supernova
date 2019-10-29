class Cache {
  constructor(initialPayload) {
    this.update(initialPayload)
  }

  clear(){ 
    this.cacheKey = null
    this.payload = null 
  }

  loaded() { return !!this.payload }
  
  update(payload) { 
    if(!payload) return false
    const newCacheKey = JSON.stringify(payload)
    let hasNew = false
    if(!this.cacheKey || this.cacheKey !== newCacheKey) { 
      this.cacheKey = newCacheKey
      this.payload = payload
      hasNew = true
    }
    return hasNew
  }

  get() { return this.payload }
}

Object.freeze(Cache)
module.exports = Cache