import React, {useMemo} from 'react'

// import RegionSeverityBadges from './shared/SeverityBadges'
import { useDispatch } from '../lib/globalState'
import RegionSeverityCount from './shared/RegionSeverityCount'
import useActiveRegionFilter from '../lib/hooks/useActiveRegionFilter'


export default ({items, counts, labelFilters, isFullScreen}) => {
  if(!items) return null
  
  const dispatch = useDispatch()
  const activeRegions = useActiveRegionFilter()

  const sortedRegions = useMemo(() => {
    const tmpItems = items.slice().sort((a,b) => a.localeCompare(b))
    return tmpItems.filter(r => activeRegions.indexOf(r) >= 0)
  }, [items,activeRegions])

  const handleClick = (region) => {
    if(labelFilters.settings.region.includes(region)) {
      return dispatch({type: 'REMOVE_FILTER', name: 'region', value: region})
    }
    // dispatch({type: 'SET_VALUES_FOR_FILTER', name: 'region', values: [region]})
    dispatch({type: 'ADD_FILTER', name: 'region', value: region})

  }

  const wrapperActive = (region) => {
    // check if region is currently selected
    return labelFilters.settings.region.includes(region) ? "active" : ""
  }

  const regionSelectionActive = () => {
    // return active only if at least one region is selected
    return ((!Array.isArray(labelFilters.settings.region) || !labelFilters.settings.region.length)) ? "" : "active"
  }


  return (
    <div className={`regions-panel ${regionSelectionActive()} ${isFullScreen ? "fullscreen" : ""}`}>
      {sortedRegions.map(region =>
        <div className={`region-wrapper ${wrapperActive(region)}`} key={region}>
          <div className="region" key={region} onClick={() => handleClick(region)} >
            <div className="region-name">{region}</div>
            {["critical", "warning", "info"].map((severity, index) =>
              <RegionSeverityCount 
                key={`${severity}-${index}`} 
                severity={severity} 
                region={region}
                count={counts[region][severity]} 
                countSilenced={counts[region][`${severity}Silenced`]}
                countAcked={counts[region][`${severity}Acked`]}
                countHandled={counts[region][`${severity}Handled`]} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
