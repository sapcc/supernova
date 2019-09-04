import React, {useMemo} from 'react'

// import RegionSeverityBadges from './shared/SeverityBadges'
import { useDispatch } from '../lib/globalState'
import RegionSeverityCount from './shared/RegionSeverityCount'
import { isExpressionWrapper } from '@babel/types';


export default ({items, counts, labelFilters, categories}) => {
  if(!items) return null
  
  const dispatch = useDispatch()

  const sortedRegions = useMemo(() => {
    let tmpItems = items.slice()

    // if a landscape category is active then filter regions
    const landscapeCategories = categories.items.filter(c => 
      c.active && c.area === 'landscape' && c.match_re.region
    )

    if(landscapeCategories.length > 0) {
      tmpItems = tmpItems.filter(region => {
        return landscapeCategories.reduce((insideLandscape,category) => {
          const regex = new RegExp(category.match_re.region)
          return insideLandscape && regex.test(region)
        },true)
      })
    }
    // END
    
    // return the filtered items alphabetically
    return tmpItems.sort((a,b) => a.localeCompare(b))

    // return REGION_SORT_REGEX.map(regionRegexList => {
    //   let result = []

    //   for(let regionRegex of regionRegexList) {
    //     const items = tmpItems.filter(region => regionRegex.test(region)).sort()
    //     result = result.concat(items)
    //     tmpItems = tmpItems.filter(item => !items.includes(item))
    //   }  
    //   return result
    // })
  }, [items,categories.items])

  const handleClick = (region) => {
    if(labelFilters.settings.region.includes(region)) {
      return dispatch({type: 'REMOVE_FILTER', name: 'region', value: region})
    }
    dispatch({type: 'SET_VALUES_FOR_FILTER', name: 'region', values: [region]})
  }

  return (
    <div className="regions-panel">
      {sortedRegions.map(region =>
        <div className="region-wrapper">
          <div className={labelFilters.settings.region.includes(region) ? "region active" : "region"} key={region} onClick={() => handleClick(region)} >
            <div className="region-name">{region}</div>
            {["critical", "warning", "info"].map(severity =>
              <RegionSeverityCount severity={severity} count={counts[region][severity]} countSilenced={counts[region][`${severity}Acked`]} />
            )}
            
            
          </div>
        </div>
      )}
    </div>
  )

  //return null
  // return (
  //   <div style={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
  //     {sortedRegions.map((regionList,i1) => 
  //       <div key={i1} style={{flexGrow: 1}}>{regionList.map((region,i2) => 
  //         <div key={i2} style={{width: '100%', padding: '2px 15px'}}>
  //           <Button 
  //             block 
  //             active={labelFilters.settings.region.includes(region)} 
  //             color='light' 
  //             onClick={() => handleClick(region)}>
  //             {region} {' '}
  //             <RegionSeverityBadges small {...counts[region]} />
  //           </Button>    
  //         </div>
  //       )}
  //       </div>
  //     )}  
  //   </div>
  // )
}
