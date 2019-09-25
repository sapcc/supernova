import {useEffect} from 'react'
import { useDispatch } from '../globalState'
import axios from 'axios'

export default () => {
  const dispatch = useDispatch()

  useEffect(() => {
    axios.get('/api/auth/profile').then(response => {
      dispatch({type: 'RECEIVE_USER_PROFILE', profile: response.data})
    }).catch(error => dispatch({type: 'REQUEST_USER_PROFILE_FAILURE', error}))
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
