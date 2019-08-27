import {useEffect} from 'react'
import { useDispatch } from '../globalState'
import openSocket from 'socket.io-client'
import axios from 'axios'

export default (initialURLFilters) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // load default values
    const loadConfig = () => {
      dispatch({type: 'REQUEST_CATEGORIES'})
      dispatch({type: 'REQUEST_FILTERS'})
      axios.get('/api/config')
        .then(response => response.data)
        .then(config => {
          // extend default values with values from URL
          if(initialURLFilters.category) {
            config.categories.forEach(c => c.active = (initialURLFilters.category.indexOf(c.name) > -1))
          }
          if(initialURLFilters.label) { 
            config.labelFilters = Object.assign(config.labelFilters, initialURLFilters.label)
            //dispatch({type: 'SET_EXTRA_FILTERS_VISIBLE', visible: true}) // if we have initial filters via URL ensure that extra filter panel is visible (ideally we would toggle it only if the url-provided filter is one of the hidden ones but I haven't figured out a way to get past the race condition of the useFilters hook with the loadConfig process)
          }
          return config
        })
        .then(config => {
          dispatch({type:'RECEIVE_CATEGORIES', items: config.categories})
          dispatch({type:'RECEIVE_LABEL_FILTERS', settings: config.labelFilters})
        })
        .catch(error => { 
          dispatch({type: 'REQUEST_CATEGORIES_FAILURE'})
          dispatch({type: 'REQUEST_LABEL_FILTERS_FAILURE'})
        })
      }

      const loadAlerts = () => {
        dispatch({type: 'REQUEST_ALERTS'})
        let socket = openSocket('/')
        socket.on('alerts update', alerts => {
          const {items,counts,labelValues} = alerts
          if(alerts) dispatch({type: 'RECEIVE_ALERTS', items,counts,labelValues})
        })
      }   

      loadConfig()
      loadAlerts()
    
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
