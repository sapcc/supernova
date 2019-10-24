import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const AckButton = ({pagerDutyInfos,fingerprint}) => {
  const [confirm,setConfirm] = useState(false)
  const [isSending,setIsSending] = useState(false)
  const [acked,setAcked] = useState(pagerDutyInfos && 
    pagerDutyInfos.acknowledgements && 
    pagerDutyInfos.acknowledgements.length>0
  )

  useEffect(() => {
    let timer
    if(confirm) {
      timer = setTimeout(() => setConfirm(false), 5000)
    }
    return () => clearTimeout(timer)
  },[confirm])

  const handleClick = (e) => {
    e.preventDefault()
    if(!confirm) {
      setConfirm(true)
      return
    }
    
    setIsSending(true)
    axios.put(`/api/alerts/${fingerprint}/ack`)
      .then(response => setAcked(true) )
      .catch(error => alert(`${error.response.status} ${error.response.data}`))
      .finally(() => setIsSending(false))
    setConfirm(false)
  }

  return (
    pagerDutyInfos.incidentId &&
      <button className="btn btn-xs" onClick={handleClick} disabled={acked || isSending}>
        {isSending 
          ? <React.Fragment><FontAwesomeIcon icon="sun" className="fa-spin"/> Ack...</React.Fragment>
          : confirm ? 'Confirm' : acked ? 'Acked' : 'Ack'
        }
      </button>
  )
}

const AlertActionButtons = ({alert}) => {
  
  return (
    <div className="action-buttons-vertical">
      {alert.status && alert.status.pagerDutyInfos &&
        <AckButton pagerDutyInfos={alert.status.pagerDutyInfos} fingerprint={alert.fingerprint}/>
      }
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
      {alert.annotations.mail_subject && 
        <a href={`mailto:?subject=${encodeURIComponent(alert.annotations.mail_subject)}&body=${encodeURIComponent(alert.annotations.mail_body)}`} rel="noopener noreferrer" className="btn btn-xs">Email Owner</a>
      }
    </div>
  )
}

export default AlertActionButtons