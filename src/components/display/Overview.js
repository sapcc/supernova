import React from 'react'
import useActiveRegionFilter from '../../lib/hooks/useActiveRegionFilter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UncontrolledTooltip } from 'reactstrap'

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
    fontSize: '1.5rem',
    textTransform: 'uppercase'
  }
}
const colors = { critical: 'red', warning: 'rgb(234,184,57)', info: 'rgb(101,197,219)'}

const Handled = ({acked,silenced,handled,region,severity}) => 
  <div style={styles.infos}>  
      { handled >0 && 
      <React.Fragment>
        <div style={styles.info} id={`${region}-${severity}`}>
          <FontAwesomeIcon  icon={["far", "bell-slash"]}/> {handled } 
        </div>    
        <UncontrolledTooltip placement='right' target={`${region}-${severity}`}>
          <div style={{...styles.info, fontSize: '1rem'}}>
            {acked > 0 && `acked - ${acked}`}
              {acked >0 && silenced >0 && <br/>}
            {silenced > 0 && `silenced - ${silenced}`}
         </div>  
        </UncontrolledTooltip>
      </React.Fragment>
    }
  </div>         



const RegionSeverity = ({
  region,critical,warning,info,
  criticalSilenced,warningSilenced,infoSilenced,
  criticalAcked,warningAcked,infoAcked,
  criticalHandled,warningHandled,infoHandled}) => 

    <div style={styles.region}>
      <div style={styles.box}>
        <div style={{...styles.content,backgroundColor: '#212124'}}><div style={styles.regionName}>{region}</div></div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.content, backgroundColor: critical > 0 ? colors.critical: 'black'}}>
          <div style={styles.severity}>
            {criticalHandled >0 ? critical-criticalHandled : critical }
          </div>
            <Handled region={region} severity='critical' acked={criticalAcked} silenced={criticalSilenced} handled={criticalHandled}/>
        </div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.content,backgroundColor: warning > 0 ? colors.warning: 'black'}}>
          <div style={styles.severity}>
            {warningHandled >0 ? warning-warningHandled : warning }
          </div>
          <Handled region={region} severity='warning' acked={warningAcked} silenced={warningSilenced} handled={warningHandled}/> 
        </div>
      </div>    
      
      <div style={styles.box}>
        <div style={{...styles.content,backgroundColor: info > 0 ? colors.info: 'black'}}>
          <div style={styles.severity}>
            {infoHandled >0 ? info-infoHandled : info }
          </div>
          <Handled region={region} severity='info' acked={infoAcked} silenced={infoSilenced} handled={infoHandled}/> 
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
          <RegionSeverity key={index} region={region} {...counts[region]}/>
        )}
      </div>
    </div>    
  )
}
