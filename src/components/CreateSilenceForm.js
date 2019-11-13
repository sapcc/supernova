import React, {useState} from 'react'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import axios from 'axios'

//() => axios.post(`/api/silences/${fingerprint}`)
export default ({alert,onSuccess,onFailure,Body,Buttons,hide}) => {
  const [duration,setDuration] = useState(4)
  const [comment,setComment] = useState('')
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState(null)
  const [success,setSuccess] = useState(false)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(false)
    axios.post(`/api/silences/${alert.fingerprint}`,{duration,comment})
    .then(() => { setSuccess(true); onSuccess()})
    .catch(error => setError(error.response.data))
    .finally(() => setSubmitting(false))
  }

  return(
    <Form onSubmit={handleSubmit}>
      <Body>
        {error && <div className="alert alert-danger" role="alert">
          {''+error}
        </div>}
        { success 
          ? <div className="alert alert-info" role="alert">
              A silence object was created successfully. Please note that it may take up to 5 minutes for the alert to show up as silenced.
            </div>
          :
          <React.Fragment>
            <FormGroup>
              <Label>Description *</Label>
              <Input type="textarea" name="comment" value={comment} onChange={(e) => setComment(e.target.value)}/>
            </FormGroup>
            <FormGroup>
              <Label>Duration</Label>
              <Input type="select" name="duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value={2}>2 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>1 day</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
              </Input>
            </FormGroup>
          </React.Fragment>
        }
      </Body>

      <Buttons>
        <Button color='secondary' type='button' onClick={(e) => {e.preventDefault(); hide()}}>Close</Button>
        {!success && <Button color="primary" disabled={submitting || !comment} type="submit">{submitting ? 'Processing...' : 'Save'}</Button>}
      </Buttons>
    </Form>
  )
}