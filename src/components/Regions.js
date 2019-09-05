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
    if(labelFilters.settings.region.includes(region)) {
      return dispatch({type: 'REMOVE_FILTER', name: 'region', value: region})
    }
    dispatch({type: 'SET_VALUES_FOR_FILTER', name: 'region', values: [region]})
  }
  console.log('::::::::::::::',counts)

  return (
    <div className="regions-panel">
      {sortedRegions.map(region =>
        <div className="region-wrapper" key={region}>
          <div className={labelFilters.settings.region.includes(region) ? "region active" : "region"} key={region} onClick={() => handleClick(region)} >
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
