import React from 'react'
import { Container, Row, Col } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import SimplePopover from './../shared/SimplePopover'


const ContactsDetailsList = ({mainKey, details}) => {

    return (
        <Container fluid={true} className="support-contact-details">
            <Row>
              { details && details.levels
                ? 
                <React.Fragment>
                    {Object.entries(details.levels).map(([key, level]) =>
                        <Col key={key} lg>
                            <h6>{level.label}</h6>
                            <dl>
                                <dt>Hotline</dt>
                                <dd>
                                    <ul className="u-plain-list">
                                        {level.hotline.map((hotlineNumber, index) =>
                                            <li key={`${mainKey}-${key}-number-${index}`}>
                                                {hotlineNumber.number}
                                                {hotlineNumber.note &&
                                                    <React.Fragment>
                                                        <FontAwesomeIcon icon="exclamation-triangle" id={`note-${key}-number-${index}`} className="icon-danger icon-clickable" onClick={(e) => e.stopPropagation()} />
                                                        <SimplePopover type="danger" clickTarget={`note-${key}-number-${index}`} text={hotlineNumber.note} />
                                                    </React.Fragment>
                                                }
                                            </li>
                                        )}
                                    </ul>
                                </dd>
                                <dt>SPC Queue</dt>
                                <dd>{level.spc_queue}</dd>
                            
                                <dt>Team DL</dt>
                                <dd>{level.team_dl}</dd>
                            
                                <dt>Operational Lead</dt>
                                <dd>{level.operational_lead}</dd>
                            
                                <dt>Accountable Manager</dt>
                                <dd>{level.accountable_manager}</dd>
                            </dl>
                        </Col>
                    )}
                    <Col md="auto">
                        <h6>Other Contacts</h6>
                        <dl>
                            <dt>Accountable Manager</dt>
                            <dd>{details.accountable_manager ? details.accountable_manager : "N/A"}</dd>

                            <dt>Change Coordinator</dt>
                            <dd>
                              { details.change_coordinator 
                                ? 
                                <ul className="u-plain-list">
                                    {details.change_coordinator.map((entry, index) =>
                                        <li key={index}>{entry}</li>
                                    )}
                                </ul>
                                : 
                                "N/A"
                              }
                            </dd>
                            
                            <dt>Change Validation Experts</dt>
                            <dd>
                              { details.change_validation_experts 
                                ? 
                                <ul className="u-plain-list">
                                    {details.change_validation_experts.map((entry, index) =>
                                        <li key={index}>{entry}</li>
                                    )}
                                </ul>
                                : 
                                "N/A"
                              }
                            </dd>
                        </dl>
                    </Col>
                </React.Fragment>
                :
                <div>No further details available</div>
              }   
            </Row>
        </Container>
    )
}

export default ContactsDetailsList