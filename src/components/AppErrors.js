import React, {useEffect, useState} from 'react'
import { Alert } from 'reactstrap'

import { useGlobalState } from '../lib/globalState'

// Displays application errors stored in global state as an Alert
const AppErrors = () => {

  const state = useGlobalState()

  const { app } = state
  const appErrors = app.error
  const appErrorSeverity = app.errorSeverity

  const [visible, setVisible] = useState(false);

  const onDismiss = () => setVisible(false);

  useEffect(() => {
    if (appErrors && appErrors.length) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [appErrors])

  return (
    <Alert color={appErrorSeverity} isOpen={visible} toggle={onDismiss}>
      {appErrors}
    </Alert>
  )

}

export default AppErrors