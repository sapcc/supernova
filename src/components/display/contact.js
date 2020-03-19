import React, {useState} from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import ContactsDetailsList from './contactsDetails'
import SimplePopover from './../shared/SimplePopover'


const Contact = React.memo(({contact, contactInfo, detailsExpanded}) => {

  const [detailsVisible, setDetailsVisible] = useState(detailsExpanded)


  const toggleDetails = (target) => {
    // only allow the toggling of details if it isn't predefined as being expanded
    if (!detailsExpanded) {
      setDetailsVisible(!detailsVisible)
    }
  }


  return (
    <React.Fragment>
      <tr className="u-clickable" onClick={() => toggleDetails(contact)}>
        <td>{contactInfo.label}</td>
        <td>
          {contactInfo.hotline.map((hotlineNumber, index) =>
            <div key={`${contact}-number-${index}`}>
              {hotlineNumber.number}
              {hotlineNumber.note &&
                <React.Fragment>
                  <FontAwesomeIcon icon="exclamation-triangle" id={`note-${contact}-number-${index}`} className="icon-danger" onClick={(e) => e.stopPropagation()} />
                  <SimplePopover type="danger" clickTarget={`note-${contact}-number-${index}`} text={hotlineNumber.note} />
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
      {detailsVisible &&
        <tr key={`${contact}-sub`}>
          <td colSpan="6">
            <ContactsDetailsList mainKey={contact} details={contactInfo.details} />
          </td>
        </tr>
      }
    </React.Fragment>
  )
})

export default Contact