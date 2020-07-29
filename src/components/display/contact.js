import React, {useState} from 'react'

import { Row, Col } from 'reactstrap'
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
      <Row className="u-clickable" onClick={() => toggleDetails(contact)}>
        <Col md="2">
          <FontAwesomeIcon icon={detailsVisible ? "angle-down" : "angle-right"} fixedWidth className="icon-info" />
          {contactInfo.label}
        </Col>
        <Col md="2">
          {contactInfo.hotline.map((hotlineNumber, index) =>
            <div key={`${contact}-number-${index}`}>
              {hotlineNumber.number}
              {hotlineNumber.note &&
                <React.Fragment>
                  <FontAwesomeIcon icon="exclamation-triangle" id={`note-${contact}-number-${index}`} className="icon-danger icon-clickable" onClick={(e) => e.stopPropagation()} />
                  <SimplePopover type="danger" clickTarget={`note-${contact}-number-${index}`} text={hotlineNumber.note} />
                </React.Fragment>
              }
            </div>
          )}
        </Col>
        <Col md="2">
          {contactInfo.service_area}
        </Col>
        <Col md="2">
          {Array.isArray(contactInfo.spc_service) 
            ? 
            contactInfo.spc_service.map((service) =>
            <div key={service}>{service}</div>
            )
            :
            contactInfo.spc_service
          }
        </Col>
        <Col md="2">
          {contactInfo.spc_queue}
        </Col>
        <Col md="2">
          {contactInfo.ops_area_owner}
        </Col>
      </Row>
      {detailsVisible &&
        <ContactsDetailsList mainKey={contact} details={contactInfo.details} />
      }
    </React.Fragment>
  )
})

export default Contact