import React from 'react'

const AlertLinks = ({alert}) => {

  return (
    <span className="alert-links">
      {alert.labels.playbook && 
        <a href={`https://operations.global.cloud.sap/${alert.labels.playbook}`} target="_blank" rel="noopener noreferrer">Playbook</a>
      }
      {alert.labels.kibana && 
        <a href={`https://logs.${alert.labels.region}.cloud.sap/${alert.labels.kibana}`} target="_blank" rel="noopener noreferrer">Logs</a>
      }
      {alert.labels.dashboard && 
        <a href={`https://grafana.${alert.labels.region}.cloud.sap/d/${alert.labels.dashboard}`} target="_blank" rel="noopener noreferrer">Grafana</a>
      }
      {alert.labels.spc && 
        <a href={`https://spc.ondemand.com/ticket_create/?${alert.labels.spc}`} target="_blank" rel="noopener noreferrer">SPC Ticket</a>
      }
      {alert.labels.sentry && 
        <a href={`https://sentry.${alert.labels.region}.cloud.sap/monsoon/${alert.labels.sentry}`} target="_blank" rel="noopener noreferrer">Sentry</a>
      }
      {alert.labels.cloudops && 
        <a href={`https://dashboard.${alert.labels.region}.cloud.sap/ccadmin/cloud_admin/cloudops#/universal-search/${alert.labels.cloudops}`} target="_blank" rel="noopener noreferrer">CloudOps</a>
      }
      {alert.annotations.mail_subject && 
        <a href={`mailto:?subject=${encodeURIComponent(alert.annotations.mail_subject)}&body=${encodeURIComponent(alert.annotations.mail_body)}`} rel="noopener noreferrer">Email Owner</a>
      }
    </span>
  )
}

export default AlertLinks