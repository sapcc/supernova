import React from 'react'
import useActiveRegionFilter from '../../lib/hooks/useActiveRegionFilter'

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
  },
  content: {
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch'

  },
  severity: {
    lineHeight: '100px',
    fontSize: '3.5rem',
  },
  regionName: {
    lineHeight: '100px',
  },
  infos: {
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center'
  },
  info: {
    fontSize: '1rem',
    textTransform: 'uppercase'
  }
}
const colors = { critical: 'red', warning: 'rgb(234,184,57)', info: 'rgb(101,197,219)'}

const RegionSeverity = ({
  region,critical,warning,info,
  criticalSilenced,warningSilenced,infoSilenced,
  criticalAcked,warningAcked,infoAcked,
  criticalTreated,warningTreated,infoTreated}) => 

    <div style={styles.region}>
      <div style={styles.box}>
        <div style={{...styles.content,backgroundColor: '#212124'}}><div style={styles.regionName}>{region}</div></div>
      </div>    
      
      <div style={styles.box}>
          {console.log('critical,criticalTreated,criticalSilenced,criticalAcked',critical,criticalTreated,criticalSilenced,criticalAcked)}
        <div style={{...styles.content, backgroundColor: critical > 0 ? colors.critical: 'black'}}>
          <div style={styles.severity}>
            {criticalTreated >0 ? critical-criticalTreated : critical }
          </div>
          <div style={styles.infos}>  
            {criticalAcked > 0 && 
              <div style={styles.info}>acked - {criticalAcked}</div>
            }
            {criticalSilenced > 0 && 
              <div style={styles.info}>silenced - {criticalSilenced}</div>
            } 
          </div>         
        </div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.content,backgroundColor: warning > 0 ? colors.warning: 'black'}}>
          <div style={styles.severity}>
            {warningTreated >0 ? warning-warningTreated : warning }
          </div>
          <div style={styles.infos}>  
            {warningAcked > 0 && 
              <div style={styles.info}>acked - {warningAcked}</div>
            }
            {warningSilenced > 0 && 
              <div style={styles.info}>silenced - {warningSilenced}</div>
            } 
          </div>         
        </div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.content,backgroundColor: info > 0 ? colors.info: 'black'}}>
          <div style={styles.severity}>
            {infoTreated >0 ? info-infoTreated : info }
          </div>
          <div style={styles.infos}>  
            {infoAcked > 0 && 
              <div style={styles.info}>acked - {infoAcked}</div>
            }
            {infoSilenced > 0 && 
              <div style={styles.info}>silenced - {infoSilenced}</div>
            } 
          </div>         
        </div>
      </div>    
    </div>


export default ({regionCounts}) => {
  const activeRegions = useActiveRegionFilter()
  const counts = activeRegions.reduce((hash,region) => {
    if(regionCounts[region]) hash[region] = regionCounts[region]
    return hash
  },{})
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
