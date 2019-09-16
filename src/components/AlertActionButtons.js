import React from 'react'

const AlertActionButtons = ({alert}) => {

  return (
    <div className="action-buttons-vertical">
      {alert.labels.playbook && 
        <a href={`https://operations.global.cloud.sap/${alert.labels.playbook}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">Playbook</a>
      }
      {alert.labels.kibana && 
        <a href={`https://logs.${alert.labels.region}.cloud.sap/${alert.labels.kibana}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">Logs</a>
      }
      {alert.labels.dashboard && 
        <a href={`https://grafana.${alert.labels.region}.cloud.sap/d/${alert.labels.dashboard}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">Grafana</a>
      }
      {alert.labels.spc && 
        <a href={`https://spc.ondemand.com/ticket_create/?${alert.labels.spc}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">SPC Ticket</a>
      }
      {alert.labels.sentry && 
        <a href={`https://sentry.${alert.labels.region}.cloud.sap/monsoon/${alert.labels.sentry}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">Sentry</a>
      }
      {alert.labels.cloudops && 
        <a href={`https://dashboard.${alert.labels.region}.cloud.sap/ccadmin/cloud_admin/cloudops#/universal-search/${alert.labels.cloudops}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs">CloudOps</a>
      }
    </div>
  )
}

export default AlertActionButtons