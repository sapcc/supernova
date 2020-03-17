import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { Alert, Table } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import ContactsDetailsList from './contactsDetails'
import SimplePopover from './../shared/SimplePopover'


const ContactList = ({visible}) => {

  const [contacts, setContacts] = useState({})
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleSubLevels, setVisibleSubLevels] = useState([])

  useEffect(() => {
    // isSubscribed is used to check whether we are still subscribed to the promise. If not then don't try to fetch as this will result in a warning
    let isSubscribed = true
    axios.get('/api/support/contacts').then(response => {
      if (isSubscribed) {
        setContacts(response.data)
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

  const toggleDetails = (key) => {
    if (visibleSubLevels.includes(key)) {
      setVisibleSubLevels(visibleSubLevels.filter((lvlKey) => lvlKey !== key))
    } else {
      const temp = visibleSubLevels.slice()
      temp.push(key)
      setVisibleSubLevels(temp)
    }
  }

  return (
    <React.Fragment>
      { visible &&
        <div className="contactlist">   
          { isLoading 
            ? <span>Loading...</span>
            : error 
              ? <Alert color="danger">{error.message}</Alert>
              :
              <Table striped hover>
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
                  { Object.entries(contacts).map(([key, contactInfo]) =>
                    <React.Fragment key={key}>
                      <tr key={`${key}-main`} className="u-clickable" onClick={() => toggleDetails(key)}>
                        <td>{contactInfo.label}</td>
                        <td>
                          {contactInfo.hotline.map((hotlineNumber, index) =>
                            <div key={`${key}-number-${index}`}>
                              {hotlineNumber.number}
                              {hotlineNumber.note &&
                                <React.Fragment>
                                  <FontAwesomeIcon icon="exclamation-triangle" id={`note-${key}-number-${index}`} className="icon-danger" onClick={(e) => e.stopPropagation()} />
                                  <SimplePopover type="danger" clickTarget={`note-${key}-number-${index}`} text={hotlineNumber.note} />
                                </React.Fragment>
                              }
                            </div>
                          )}
                        </td>
                        <td>{contactInfo.service_area}</td>
                        <td>
                          {Array.isArray(contactInfo.spc_service) 
                            ? 
                            contactInfo.spc_service.map((service) =>
                              <div key={service}>{service}</div>
                            )
                            :
                            contactInfo.spc_service
                          }
                        </td>
                        <td>{contactInfo.spc_queue}</td>
                        <td>{contactInfo.ops_area_owner}</td>
                      </tr>
                      {visibleSubLevels.includes(key) &&
                        <tr key={`${key}-sub`}>
                          <td colSpan="6">
                            <ContactsDetailsList mainKey={key} details={contactInfo.details} />
                          </td>
                        </tr>
                      }
                    </React.Fragment>
                  )}
                </tbody>
              </Table>
          }
        </div>
      }
    </React.Fragment>
  )
}

export default ContactList
