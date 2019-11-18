import {useMemo, useEffect} from 'react'

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

// const unflattenJson = (flatJson) => {
//   const result = {}
//   for(let key in flatJson) {
//     const value = flatJson[key]

//     const keys = key.split('_')
//     let subJson = result, prop

//     while((prop = keys.shift())){
//       subJson[prop] = subJson[prop] || {}
//       if(keys.length === 0) subJson[prop] = value
//       subJson = subJson[prop]
//     }

//   }
    
//   return result
// }

const unflattenJson = (flatJson) => {
  const result = {}

  for(let key in flatJson) {
    const value = flatJson[key]

    // const keys = key.split('_')
    // consider only the first underline
    const index = key.indexOf('_')
    const keys = index < 0 ? [key] : [key.substr(0,index), key.substr(index+1)]
    // end

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
    // first check if value for key is not empty, if it is empty don't add key to URL
    if (flatJson[key] && flatJson[key][0]) {
      if(urlString.length > 0) urlString += '&'
      if(flatJson[key] instanceof Array) urlString += `${key}=`+flatJson[key].join(`&${key}=`)
    }
  }
  return urlString
}

/**
 * This function converts a URL string to flat json object.
 **/ 
const urlStringToJson = (urlString) => {
  if(!urlString || urlString.length === 0) return null

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
 * Exports a default function which expects a json object 
 * with keys to look for in URL and values.
 * Returns a json object containing current url filters.
 **/ 
export default (filters) => {
  const host = `${window.location.protocol}//${window.location.host}`
  let initial = false

  const initialUrlFilters = useMemo(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initial = true
    let params = (window.location.search || '')
    if(params[0] === '?') params = params.substr(1)
    const json = urlStringToJson(decodeURI(params))

    if(!json) return {}

    const result = {}
    Object.keys(filters).forEach(k => result[k] = json[k])
    return result
    // eslint-disable-next-line
  }, []) 
  
  useEffect(() => {
    // do nothing in initial call
    if(initial) return
     
    if(!filters || Object.keys(filters).length === 0 || Object.values(filters).flat().length === 0) {
      window.history.replaceState('', document.title, host)
    }
    const filterString = encodeURI(jsonToUrlString(filters))

    if(window.location.search !== filterString) {
      window.history.pushState('', document.title, `${host}?${filterString}`)
    }
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  return initialUrlFilters
}

