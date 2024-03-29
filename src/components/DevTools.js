import React, { useState, useEffect, useRef } from "react"
import ReactJson from "react-json-view"
import { useGlobalState, useDispatchLogger } from "../lib/globalState"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const DevTools = () => {
  const [collapsed, updateCollapsed] = useState(true)
  const state = useGlobalState()
  const [opacity, setOpacity] = useState(0.5)
  const [log, updateLog] = useState([])
  const dispatchLogger = useDispatchLogger()
  const container = useRef(null)

  useEffect(() => {
    dispatchLogger((action) => updateLog((log) => [...log, action]))
    const containerElement = container.current
    const mouseenterEventHandler = () => setOpacity(0.95)
    const mouseleaveEventHandler = () => setOpacity(0.5)
    containerElement.addEventListener("mouseenter", mouseenterEventHandler)
    containerElement.addEventListener("mouseleave", mouseleaveEventHandler)

    return () => {
      containerElement.removeEventListener("mouseenter", mouseenterEventHandler)
      containerElement.removeEventListener("mouseleave", mouseleaveEventHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 1100,
        top: 0,
        right: 0,
        height: "100%",
      }}
    >
      <button
        className="float-left"
        style={{ marginLeft: -20 }}
        onClick={() => updateCollapsed(!collapsed)}
      >
        <FontAwesomeIcon icon="code" />
      </button>
      <div
        ref={container}
        style={{
          padding: collapsed ? 0 : 5,
          backgroundColor: "rgb(39,40,34)",
          opacity,
          border: "1px solid #666",
          width: collapsed ? 0 : 400,
          overflow: "auto",
          height: "100%",
        }}
      >
        React DevTools
        <div style={{ maxHeight: 300, overflow: "auto", minHeight: 200 }}>
          {/*<ReactJson src={log} name="ACTIONS" theme='monokai' collapsed={2}/>*/}
          {log.map((entry, index) => (
            <ReactJson
              key={index}
              src={entry}
              name={entry.type}
              theme="monokai"
              collapsed={true}
            />
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <ReactJson src={state} theme="monokai" collapsed={1} name="STATE" />
        </div>
      </div>
    </div>
  )
}

export default DevTools
