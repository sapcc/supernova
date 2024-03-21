import React, { useState } from "react"
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap"
import apiClient from "../../lib/apiClient"

const NewAlertSilenceForm = ({ alert, onSuccess, Body, Buttons, hide }) => {
  const [duration, setDuration] = useState(4)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(false)
    apiClient
      .request(`/api/silences/alert/${alert.fingerprint}`, {
        method: "POST",
        body: JSON.stringify({ duration, comment }),
      })
      .then(() => {
        setSuccess(true)
        onSuccess()
      })
      .catch((error) => {
        setError(error.message)
      })
      .finally(() => setSubmitting(false))
  }

  return (
    <Form onSubmit={handleSubmit} style={{ overflow: "auto" }}>
      <Body>
        {error && <Alert color="danger">{"" + error}</Alert>}
        {success ? (
          <Alert color="info">
            A silence object was created successfully. Please note that it may
            take up to 5 minutes for the alert to show up as silenced.
          </Alert>
        ) : (
          <React.Fragment>
            <Alert color="info">
              Alert:
              <br />
              {alert.annotations.description}
            </Alert>
            <FormGroup>
              <Label>Description *</Label>
              <Input
                type="textarea"
                name="comment"
                value={comment}
                rows="5"
                onChange={(e) => setComment(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Duration</Label>
              <Input
                type="select"
                name="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value={2}>2 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>1 day</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
              </Input>
            </FormGroup>
          </React.Fragment>
        )}
      </Body>

      <Buttons>
        <Button
          color="secondary"
          type="button"
          onClick={(e) => {
            e.preventDefault()
            hide()
          }}
        >
          Close
        </Button>
        {!success && (
          <Button
            color="primary"
            disabled={submitting || !comment}
            type="submit"
          >
            {submitting ? "Processing..." : "Save"}
          </Button>
        )}
      </Buttons>
    </Form>
  )
}

export default NewAlertSilenceForm
