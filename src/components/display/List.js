import React from 'react'

export default ({regionSeverities}) => {
  
  return (
    <div style={{height: '100%', width: '100%', backgroundColor: '#161719'}}>
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
      {Object.keys(regionSeverities).map((region,index) => 
        <div key={index} style={{verticalAlign: 'middle', minWidth: '50%', color: 'white', display: 'flex', height: 110, padding: '0 10px'}}>
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '2rem', backgroundColor: '#212124', height: 100, lineHeight: '100px'}}>{region}</div>
          </div>    
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '3.5rem', height: 100, lineHeight: '100px', backgroundColor: regionSeverities[region].critical > 0 ? 'red': 'black'}}>
                {regionSeverities[region].criticalAcked >0 ? regionSeverities[region].critical-regionSeverities[region].criticalAcked : regionSeverities[region].critical }
                {regionSeverities[region].criticalAcked && 
                  <span style={{fontSize: '1rem'}}>SILENCED {regionSeverities[region].criticalAcked}</span>
                }
            </div>
          </div>    
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '3.5rem', height: 100, lineHeight: '100px', backgroundColor: regionSeverities[region].warning > 0 ? 'rgb(234, 184, 57)': 'black'}}>
                {regionSeverities[region].warning}
            </div>
          </div>    
          <div style={{flexBasis: '100%', flexGrow: 1, padding: 5}}>
            <div style={{textAlign: 'center',fontSize: '3.5rem', height: 100, lineHeight: '100px', backgroundColor: regionSeverities[region].info > 0 ? 'rgb(101, 197, 219)': 'black'}}>
                {regionSeverities[region].info}
            </div>
          </div>    
        </div>
      )}
      </div>
    </div>    
  )
}
