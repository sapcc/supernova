import React, {useMemo} from 'react'

// import RegionSeverityBadges from './shared/SeverityBadges'
import { useDispatch } from '../lib/globalState'
import RegionSeverityCount from './shared/RegionSeverityCount'
import useActiveRegionFilter from '../lib/hooks/useActiveRegionFilter'


export default ({items, counts, labelFilters, categories}) => {
  if(!items) return null
  
  const dispatch = useDispatch()
  const activeRegions = useActiveRegionFilter()

  const sortedRegions = useMemo(() => {
    const tmpItems = items.slice().sort((a,b) => a.localeCompare(b))
    return tmpItems.filter(r => activeRegions.indexOf(r) >= 0)
  }, [items,activeRegions])

  const handleClick = (region) => {
    console.log(activeRegions);
    if(labelFilters.settings.region.includes(region)) {
      // dispatch({type: 'REGION_FILTER_ACTIVE', isActive: false})
      return dispatch({type: 'REMOVE_FILTER', name: 'region', value: region})
    }
    // dispatch({type: 'REGION_FILTER_ACTIVE', isActive: true})
    dispatch({type: 'SET_VALUES_FOR_FILTER', name: 'region', values: [region]})
  }

  const wrapperClassName = (region) => {
    return labelFilters.settings.region.includes(region) ? "region-wrapper active" : "region-wrapper"
  }



  return (
    <div className="regions-panel">
      {sortedRegions.map(region =>
        <div className={wrapperClassName(region)} key={region}>
          <div className="region" key={region} onClick={() => handleClick(region)} >
            <div className="region-name">{region}</div>
            {["critical", "warning", "info"].map((severity, index) =>
              <RegionSeverityCount key={`${severity}-${index}`} severity={severity} count={counts[region][severity]} countSilenced={counts[region][`${severity}Silenced`]} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
