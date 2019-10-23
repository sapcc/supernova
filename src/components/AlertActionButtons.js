import React from 'react'

const AlertActionButtons = ({alert}) => {

  return (
    <div className="action-buttons-vertical">
      {/* {alert.labels.playbook && 
        <a href={`https://operations.global.cloud.sap/${alert.labels.playbook}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">Playbook</a>
      }
      {alert.labels.kibana && 
        <a href={`https://logs.${alert.labels.region}.cloud.sap/${alert.labels.kibana}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">Logs</a>
      }
      {alert.labels.dashboard && 
        <a href={`https://grafana.${alert.labels.region}.cloud.sap/d/${alert.labels.dashboard}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">Grafana</a>
      } */}
    </div>
  )
}

export default AlertActionButtons