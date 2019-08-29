import React, { useState, useEffect, useRef } from 'react'
import ReactJson from 'react-json-view'
import { useGlobalState, useDispatchLogger } from '../lib/globalState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default () => {
  const [collapsed,updateCollapsed] = useState(true)
  const state = useGlobalState()
  const [opacity,setOpacity] = useState(0.5)
  const [log,updateLog] = useState([])
  const dispatchLogger = useDispatchLogger()
  const container = useRef(null)

  useEffect(() => {

    dispatchLogger((action) => updateLog(log => [...log, action]))

    container.current.addEventListener("mouseenter", () => setOpacity(0.95))
    container.current.addEventListener("mouseleave", () => setOpacity(0.5))


    return () => {
      container.current.removeEventListener("mouseenter")
      container.current.removeEventListener("mouseleave")
    }
  }, [])


  return (
    <div
        style={{    
          position: 'fixed',
          zIndex: 1000,
          top: 0,
          right: 0,
          height: '100%',
        }}>
      <button className='float-left' style={{marginLeft: -20}} onClick={() => updateCollapsed(!collapsed)}>
        <FontAwesomeIcon icon="code"/>
      </button>
      <div 
        ref={container}
        style={{    
          padding: collapsed ? 0 : 5,
          backgroundColor: 'rgb(39,40,34)',
          opacity,
          border: '1px solid #666',
          width: collapsed ? 0 : 400,
          overflow: 'auto',
          height: '100%',
        }}>
        React DevTools

        <div style={{maxHeight: 300, overflow: 'auto', minHeight: 200}}>
          {/*<ReactJson src={log} name="ACTIONS" theme='monokai' collapsed={2}/>*/}
          {log.map((entry,index) => 
            <ReactJson key={index} src={entry} name={entry.type} theme='monokai' collapsed={true}/>
          )}
        </div>
        <div style={{marginTop: 20}}>
          <ReactJson 
            src={state}
            theme='monokai'
            collapsed={1} 
            name='STATE'
          />
        </div>
      </div>
    </div>  
  )
}
