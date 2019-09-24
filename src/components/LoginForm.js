import React, {useState} from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch } from '../lib/globalState'

export default () => {
  const [name,updateName] = useState('')
  const [password,updatePassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true) 
    axios
      .post('/api/auth/login', {name,password})
      .then(response => {
        setSubmitting(false)
        console.log(response.data)
        dispatch({type: 'RECEIVE_USER_PROFILE', profile: response.data})
      })
      .catch(error => {
        setSubmitting(false)
        console.log(error)
      })
  }

  return (
    <section style={{color: 'white', maxWidth: 220, margin: '100px auto'}}>
      <form onSubmit={handleSubmit} role="login">
        <section style={{marginBottom: 30}}>
          <h2><FontAwesomeIcon icon="sun" className={`logo text-primary ${submitting && 'fa-spin'}`}/> Supernova</h2>
        </section>
        
        <label>D/C/I-Number</label>			
        <input 
          type="name" 
          name="name" 
          required="" 
          className="form-control" 
          value={name} 
          onChange={(e) => updateName(e.target.value)}/>
        
        <label>Password</label>
        <input 
          type="password" 
          name="password" 
          required="" 
          className="form-control"
          value={password} onChange={(e) => updatePassword(e.target.value)}/>
        <br/>
        <button type="submit" name="go" className="btn btn-block btn-primary" disabled={submitting}>Sign in</button>
      </form>
    </section>
  )
}