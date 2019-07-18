
import {useMemo} from 'react'

export default () => {
  const activeFilters = useMemo(() => {
    const hash = window.location.hash || ''
    const found = hash.match(/#filters=([^&]*)/)
    if (found && found[1]) return decodeURI(found[1]).split(',')
    return []
  }, []) 

  const setActiveFilters = (filterNames) => {
    if(!filterNames || filterNames.length === 0) {
      const noHashURL = window.location.href.replace(/#.*$/, '')
      window.history.replaceState('', document.title, noHashURL)
      return null
    }

    const filterString = encodeURI(filterNames.join(','))
    const found = window.location.hash.match(/#filters=([^&]*)/)
    
    if (!found || !found[1] || found[1] !== filterString) {
      window.location.hash = `filters=${filterString}`
    }  
    return filterNames
  }
  return [activeFilters, setActiveFilters]
}

