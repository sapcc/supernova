import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useGlobalState } from '../lib/globalState'

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
      <button className="btn btn-xs" onClick={handleClick} disabled={isSending}>
        {isSending 
          ? <React.Fragment><FontAwesomeIcon icon="sun" className="fa-spin"/> Ack...</React.Fragment>
          : confirm ? 'Confirm' : 'Ack'
        }
      </button>
  )
}

const SilenceButton = ({alert,createSilence}) => {
  const handleClick = (e) => {
    e.preventDefault()
    createSilence(alert)
      //.then(() => alert('OK'))
      //.catch( error => alert('KO',error))
  }
  return <button className="btn btn-xs" onClick={handleClick}>Silence</button>
}

const AlertActionButtons = ({alert,createSilence}) => {
  const {user} = useGlobalState()

  return (
    <div className="action-buttons-vertical">
      {user.profile.editor && alert.status && alert.status.pagerDutyInfos &&
        <AckButton pagerDutyInfos={alert.status.pagerDutyInfos} fingerprint={alert.fingerprint}/>
      }
      {user.profile.editor && 
        <SilenceButton alert={alert} createSilence={createSilence}/>
      }
    </div>
  )
}

export default AlertActionButtons