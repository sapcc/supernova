import React, { useState, useEffect } from "react"
import apiClient from "../lib/apiClient"
import classnames from "classnames"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useGlobalState } from "../lib/globalState"

const AckButton = ({ pagerDutyInfos, fingerprint }) => {
  const [confirm, setConfirm] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [acked, setAcked] = useState(
    pagerDutyInfos &&
      pagerDutyInfos.acknowledgements &&
      pagerDutyInfos.acknowledgements.length > 0
  )

  useEffect(() => {
    let timer
    if (confirm) {
      timer = setTimeout(() => setConfirm(false), 5000)
    }
    return () => clearTimeout(timer)
  }, [confirm])

  const handleClick = (e) => {
    e.preventDefault()
    if (!confirm) {
      setConfirm(true)
      return
    }

    setIsSending(true)
    apiClient
      .request(`/api/alerts/${fingerprint}/ack`, { method: "PUT" })
      .then(() => setAcked(true))
      .catch((error) => alert(error.message))
      .finally(() => setIsSending(false))
    setConfirm(false)
  }

  return (
    pagerDutyInfos.incidentId && (
      <button className="btn" onClick={handleClick} disabled={isSending}>
        {isSending ? (
          <React.Fragment>
            <FontAwesomeIcon icon="sun" className="fa-spin" /> Ack...
          </React.Fragment>
        ) : confirm ? (
          "Confirm"
        ) : (
          "Ack"
        )}
      </button>
    )
  )
}

const SilenceButton = ({ alert, createSilence }) => {
  const handleClick = (e) => {
    e.preventDefault()
    createSilence(alert)
    //.then(() => alert('OK'))
    //.catch( error => alert('KO',error))
  }
  return (
    <button className="btn" onClick={handleClick}>
      Silence
    </button>
  )
}

const AlertActionButtons = ({ alert, createSilence, containerClasses }) => {
  const { user } = useGlobalState()

  var containerClassName = classnames({
    "action-buttons": true,
    [`${containerClasses}`]: containerClasses,
    "action-buttons-vertical": !containerClasses,
  })

  return (
    <div className={containerClassName}>
      {user.profile.editor && alert.status && alert.status.pagerDutyInfos && (
        <AckButton
          pagerDutyInfos={alert.status.pagerDutyInfos}
          fingerprint={alert.fingerprint}
        />
      )}
      {user.profile.editor && (
        <SilenceButton alert={alert} createSilence={createSilence} />
      )}
    </div>
  )
}

export default AlertActionButtons
