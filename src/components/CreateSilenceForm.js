import React, {useState} from 'react'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import axios from 'axios'

//() => axios.post(`/api/silences/${fingerprint}`)
export default ({alert,onSuccess,onFailure,Body,Buttons,hide}) => {
  const [duration,setDuration] = useState(4)
  const [comment,setComment] = useState('')
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState(null)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    axios.post(`/api/silences/${alert.fingerprint}`,{duration,comment})
    .then(() => {hide(); onSuccess()})
    .catch(error => setError(error.response.data))
    .finally(() => setSubmitting(false))
  }

  return(
    <Form onSubmit={handleSubmit}>
      <Body>
        {error && <div className="alert alert-danger" role="alert">
          {''+error}
        </div>}
        <FormGroup>
          <Label>Description *</Label>
          <Input type="textarea" name="comment" value={comment} onChange={(e) => setComment(e.target.value)}/>
        </FormGroup>
        <FormGroup>
          <Label>Duration</Label>
          <Input type="select" name="duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
            <option value={5}>5 hours</option>
            <option value={6}>6 hours</option>
            <option value={7}>7 hours</option>
            <option value={8}>8 hours</option>
            <option value={9}>9 hours</option>
            <option value={10}>10 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>1 day</option>
          </Input>
        </FormGroup>
      </Body>

      <Buttons>
        <Button color='secondary' type='button' onClick={(e) => {e.preventDefault(); hide()}}>Close</Button>
        <Button color="primary" disabled={submitting || !comment} type="submit">{submitting ? 'Processing...' : 'Save'}</Button>
      </Buttons>
    </Form>
  )
}