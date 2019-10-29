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