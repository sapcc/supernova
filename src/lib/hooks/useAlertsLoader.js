import {useEffect} from 'react'
import { useDispatch } from '../globalState'
import openSocket from 'socket.io-client'

export default (initialURLFilters) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // load default values
    const loadAlerts = () => {
      dispatch({type: 'REQUEST_ALERTS'})
      let socket = openSocket('/')
      socket.on('alerts update', alerts => {
        const {items,counts,labelValues} = alerts
        if(alerts) dispatch({type: 'RECEIVE_ALERTS', items,counts,labelValues})
      })
    }   
  
    const loadSilences = () => {
      dispatch({type: 'REQUEST_SILENCES'})
      let socket = openSocket('/')
      socket.on('silences update', response => {
        if(response && response.items) dispatch({type: 'RECEIVE_SILENCES', items: response.items})
      })
    }   

    //loadConfig()
    loadAlerts()
    loadSilences()
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
