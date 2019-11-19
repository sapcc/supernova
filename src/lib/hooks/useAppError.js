import { useDispatch } from '../globalState'

// Can display an error which will appear just above the alerts list
// Provide an error text, alert severity (warning, danger, info, success)
// "timeframe" specifies how long the alert should be displayed before it disappears, if 0 the alert won't disappear on its own but is dismissible
const useAppError = () => {

  const dispatch = useDispatch()

  const showError = (text, severity, timeframe) => {
    
    dispatch({type: 'SET_APP_ERROR', error: text, errorSeverity: severity})

    if (timeframe > 0) {
      setTimeout(() => dispatch({type: 'SET_APP_ERROR', error: null}), timeframe)
    }
  }

  return showError
}

export default useAppError