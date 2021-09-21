import React, { useEffect, useState } from "react"
import apiClient from "../../lib/apiClient"
import { Alert, Row, Col, Collapse, Card, CardBody } from "reactstrap"
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useGlobalState, useDispatch } from "../../lib/globalState"
import Contact from "./contact"
// import SimplePopover from './../shared/SimplePopover'

const ContactList = React.memo(({ visible, componentKey }) => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const { contactList } = useGlobalState()
  const dispatch = useDispatch()
  // if a specific key was passed, filter all but that one contact
  const contacts = componentKey
    ? { [componentKey]: contactList.contacts[componentKey] }
    : contactList.contacts

  useEffect(() => {
    // isSubscribed is used to check whether we are still subscribed to the promise. If not then don't try to fetch as this will result in a warning
    let isSubscribed = true
    apiClient
      .request("/api/support/contacts")
      .then((response) => response.json())
      .then((data) => {
        if (isSubscribed) {
          dispatch({ type: "SET_SUPPORT_CONTACTS", contacts: data })
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((error) => {
        if (isSubscribed) {
          setIsLoading(false)
          setError({
            status: error.response && error.response.status,
            name: error.response && error.response.statusText,
            message: error.response && error.response.data,
          })
        }
      })

    return () => (isSubscribed = false)
    // eslint-disable-next-line
  }, [])

  return (
    <div className="contactlist">
      <Collapse isOpen={visible}>
        <Card>
          <CardBody>
            {isLoading ? (
              <span>Loading...</span>
            ) : error ? (
              <Alert color="danger">{error.message}</Alert>
            ) : (
              <div className="tabular-grid">
                <Row className="row-header">
                  <Col md="2">Component</Col>
                  <Col md="2">Hotline</Col>
                  <Col md="2">Service Area</Col>
                  <Col md="2">Service Offering</Col>
                  <Col md="2">Assignment Group</Col>
                  <Col md="2">OPS Area Owner</Col>
                </Row>
                {contacts ? (
                  Object.entries(contacts).map(([key, contactInfo]) => (
                    <Contact
                      key={`contact-${key}`}
                      contact={key}
                      contactInfo={contactInfo}
                      detailsExpanded={componentKey ? true : false}
                    />
                  ))
                ) : (
                  <div>
                    Support contact information is empty
                    {componentKey && <span> for component {componentKey}</span>}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </Collapse>
    </div>
  )
})

export default ContactList
