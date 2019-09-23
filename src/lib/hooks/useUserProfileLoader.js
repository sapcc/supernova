import {useEffect} from 'react'
import { useDispatch } from '../globalState'
import axios from 'axios'

export default () => {
  const dispatch = useDispatch()

  useEffect(() => {
    axios.get('/api/auth/profile').then(response => {
      console.log('::::::::::::::::::::::',response.data)
    })
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
