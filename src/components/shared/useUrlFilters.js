import {useMemo} from 'react'

/**
 * This function converts a json object to one level (flat) json.
 * { "name": {
 *     "subName1": ["value1"], 
 *     "subName2": ["value2"]
 *   }
 *  } ->
 *  { "name_subName1": ["value1"], "name_subName2": ["value2"]}
 **/ 
const flattenJson = (data) => {
  const result = {}
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur
    } else if (cur instanceof Array) {
      if(cur.length>0) result[prop] = cur
    } else {
      let isEmpty = true
      for (let p in cur) {
        isEmpty = false
        recurse(cur[p], prop ? prop+"_"+p : p)
      }
      if (isEmpty && prop)
        result[prop] = {}
    }
  }
  recurse(data, "")
  return result
}

/**
 * This function converts a flat json object to a nested json.
 * { "name_subName1": ["value1"], "name_subName2": ["value2"]}
 * ->
 * { "name": {
 *     "subName1": ["value1"], 
 *     "subName2": ["value2"]
 *   }
 *  } 
 **/  

const unflattenJson = (flatJson) => {
  const result = {}
  for(let key in flatJson) {
    const value = flatJson[key]

    const keys = key.split('_')
    let subJson = result, prop

    while((prop = keys.shift())){
      subJson[prop] = subJson[prop] || {}
      if(keys.length === 0) subJson[prop] = value
      subJson = subJson[prop]
    }

  }
  return result
}

/**
 * This function converts a flat json object to URL string.
 **/ 
const jsonToUrlString = (json) => {
  const flatJson = flattenJson(json)
  //console.log('::::::::jsonToUrlString->json',json)
  //console.log('::::::::jsonToUrlString->flatJson',flatJson)
  let urlString = ''
  for(let key in flatJson) {
    if(urlString.length > 0) urlString += '&'
    if(flatJson[key] instanceof Array) urlString += `${key}=`+flatJson[key].join(`&${key}=`)
  }
  return urlString
}

/**
 * This function converts a URL string to flat json object.
 **/ 
const urlStringToJson = (urlString) => {
  if(!urlString || urlString.length === 0) return null

  // remove first #
  if(urlString[0] === '#') urlString = urlString.substr(1)

  const values = urlString.split('&')
  const json = {}
  values.forEach(entry => {
    const [key,value] = entry.split('=')
    json[key] = json[key] || []
    json[key].push(value)
  })

  return unflattenJson(json)
}

/**
 * Exports a default function which expects an array 
 * with keys to look for in URL.
 * Returns an array with a json object containing current url filters 
 * and a setter function to modify url filters.
 **/ 
export default (keys = []) => {
  const activeFilters = useMemo(() => {
    const hash = (window.location.hash || '')
    const json = urlStringToJson(decodeURI(hash))

    if(!json) return {}

    const result = {}
    keys.forEach(k => result[k] = json[k])
    return result
    // eslint-disable-next-line
  }, []) 

  const setActiveFilters = (json = {}) => {
    if(!json || Object.keys(json).length === 0) {
      const noHashURL = window.location.href.replace(/#.*$/, '')
      window.history.replaceState('', document.title, noHashURL)
      return null
    }
    const filterString = encodeURI(jsonToUrlString(json))

    if (window.location.hash !== filterString) {
      window.location.hash = filterString
    }  
    return json
  }
  return [activeFilters, setActiveFilters]
}

