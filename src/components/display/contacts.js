import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { Alert, Table } from 'reactstrap'

import ContactsDetailsList from './contactsDetails'


const ContactList = () => {

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


  return (
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
                  <tr key={`${key}-main`}>
                    <td>{contactInfo.label}</td>
                    <td>
                      {contactInfo.hotline.map((hotlineNumber, index) =>
                        <div key={`${key}-number-${index}`}>{hotlineNumber.number}</div>
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
                  {true &&
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
  )
}

export default ContactList
