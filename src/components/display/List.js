import React from 'react'
import useRegionFilter from '../../lib/hooks/useRegionFilter'

const styles = {
  wrapper: {
    height: '100%',
    width: '100%',
    backgroundColor: '#161719'
  },
  container: {
    display: 'flex', 
    flexWrap: 'wrap'
  },
  region: {
    verticalAlign: 'middle', 
    minWidth: '50%', 
    color: 'white', 
    display: 'flex', 
    height: 110, 
    padding: '0 10px',
    fontSize: '2rem'
  },
  box: {
    flexBasis: '100%',
    flexGrow: 1,
    padding: 5,
    textAlign: 'center',
    height: 100,
    lineHeight: '100px'
  },
  severity: {
    fontSize: '3.5rem',
  }
}
const colors = { critical: 'red', warning: 'rgb(234,184,57)', info: 'rgb(101,197,219)'}

const RegionSeverity = ({region,critical,warning,info,criticalSilenced,warningSilenced,infoSilenced}) => 
    <div style={styles.region}>
      <div style={styles.box}>
        <div style={{backgroundColor: '#212124'}}>{region}</div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.severity, backgroundColor: critical > 0 ? colors.critical: 'black'}}>
          {criticalSilenced >0 ? critical-criticalSilenced : critical }
          {criticalSilenced && 
            <span style={{fontSize: '1rem'}}>SILENCED {criticalSilenced}</span>
          }
        </div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.severity,backgroundColor: warning > 0 ? colors.warning: 'black'}}>
          {warning}
        </div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.severity,backgroundColor: info > 0 ? colors.info: 'black'}}>
          {info}
        </div>
      </div>    
    </div>


export default ({regionCounts}) => {
  const activeRegions = useRegionFilter()
  const counts = {}
  activeRegions.forEach(region => {
    if(regionCounts[region]) counts[region] = {...regionCounts[region]}
  })

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {Object.keys(counts).map((region,index) => 
          <RegionSeverity region={region} {...counts[region]}/>
        )}
      </div>
    </div>    
  )
}
