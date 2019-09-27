import {useEffect} from 'react'
import { useDispatch } from '../globalState'
import axios from 'axios'
import openSocket from 'socket.io-client'

export default ({urlFilters,userProfile}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    axios.get('/api/auth/profile').then(response => {
      dispatch({type: 'RECEIVE_USER_PROFILE', profile: response.data})
    }).catch(error => dispatch({
      type: 'REQUEST_USER_PROFILE_FAILURE', 
      error: {status: error.response.status, name: error.response.statusText, message: error.response.data}
    }))
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if(!userProfile) return
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
  }, [userProfile])
}
