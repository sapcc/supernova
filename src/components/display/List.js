import React from 'react'
import useRegionFilter from '../../lib/hooks/useRegionFilter'

export default ({regionCounts}) => {
  const activeRegions = useRegionFilter()
  const counts = {}
  activeRegions.forEach(region => {
    if(regionCounts[region]) counts[region] = {...regionCounts[region]}
  })

  return (
    <div style={{height: '100%', width: '100%', backgroundColor: '#161719'}}>
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
      {Object.keys(counts).map((region,index) => 
        <div key={index} style={{verticalAlign: 'middle', minWidth: '50%', color: 'white', display: 'flex', height: 110, padding: '0 10px'}}>
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '2rem', backgroundColor: '#212124', height: 100, lineHeight: '100px'}}>{region}</div>
          </div>    
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '3.5rem', height: 100, lineHeight: '100px', backgroundColor: counts[region].critical > 0 ? 'red': 'black'}}>
                {counts[region].criticalAcked >0 ? counts[region].critical-counts[region].criticalAcked : counts[region].critical }
                {counts[region].criticalAcked && 
                  <span style={{fontSize: '1rem'}}>SILENCED {counts[region].criticalAcked}</span>
                }
            </div>
          </div>    
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '3.5rem', height: 100, lineHeight: '100px', backgroundColor: counts[region].warning > 0 ? 'rgb(234, 184, 57)': 'black'}}>
                {counts[region].warning}
            </div>
          </div>    
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '3.5rem', height: 100, lineHeight: '100px', backgroundColor: counts[region].info > 0 ? 'rgb(101, 197, 219)': 'black'}}>
                {counts[region].info}
            </div>
          </div>    
        </div>
      )}
      </div>
    </div>    
  )
}
