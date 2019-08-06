import React, { useState, useEffect, useRef } from 'react'
import ReactJson from 'react-json-view'

import { useGlobalState, useDispatchLogger } from '../lib/globalState'

export default () => {
  const state = useGlobalState()
  const container = useRef(null)
  const [opacity,setOpacity] = useState(0.5)
  const [log,updateLog] = useState([])
  const dispatchLogger = useDispatchLogger()

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
      ref={container}
      style={{    
        position: 'fixed',
        zIndex: 1000,
        top: 0,
        right: 0,
        padding: 5,
        backgroundColor: 'rgb(39,40,34)',
        opacity,
        border: '1px solid #666',
        width: 400,
        overflow: 'auto',
        height: '100%',
      }}>
      React DevTools
      <button className='float-right' style={{marginRight: 10}}>X</button>

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
  )
}
