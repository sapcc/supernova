import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { Alert, Table } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useGlobalState, useDispatch } from '../../lib/globalState'
import Contact from './contact'
import SimplePopover from './../shared/SimplePopover'


const ContactList = React.memo(({visible, componentKey}) => {

  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const state = useGlobalState()
  const dispatch = useDispatch()
  // if a specific key was passed, filter all but that one contact
  const contacts = componentKey ? {[componentKey]: state.support.contacts[componentKey]} : state.support.contacts

  useEffect(() => {
    // isSubscribed is used to check whether we are still subscribed to the promise. If not then don't try to fetch as this will result in a warning
    let isSubscribed = true
    axios.get('/api/support/contacts').then(response => {
      if (isSubscribed) {
        dispatch({type: 'SET_SUPPORT_CONTACTS', contacts: response.data})
        setError(null)
        setIsLoading(false)
      } 
    }).catch(error => {
      if (isSubscribed) {
        setIsLoading(false)
        setError({status: error.response.status, name: error.response.statusText, message: error.response.data})
      }
    })

    return () => (isSubscribed = false)
  }, [])


  return (
    <React.Fragment>
      { visible &&
        <div className="contactlist">   
          { isLoading 
            ? <span>Loading...</span>
            : error 
              ? <Alert color="danger">{error.message}</Alert>
              :
              <Table striped>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Hotline</th>
                    <th>Service Area</th>
                    <th>SPC Service</th>
                    <th>SPC Queue</th>
                    <th>OPS Area Owner</th>
                  </tr>
                </thead>
                <tbody>
                  { contacts 
                    ? 
                    Object.entries(contacts).map(([key, contactInfo]) =>
                      <Contact key={`contact-${key}`} contact={key} contactInfo={contactInfo} detailsExpanded={componentKey ? true : false} />
                    )
                    :
                    <tr>
                      <td colSpan="6">
                        Support contact information is empty
                        {componentKey && <span> for component {componentKey}</span>}
                      </td>
                    </tr>
                  }
                </tbody>
              </Table>
          }
        </div>
      }
    </React.Fragment>
  )
})

export default ContactList
