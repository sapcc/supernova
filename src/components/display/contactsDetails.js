import React from 'react'
import { Container, Row, Col } from 'reactstrap'


const ContactsDetailsList = ({mainKey, details}) => {

    return (
        <Container fluid={true}>
            <Row>
              { details && details.levels
                ? 
                <React.Fragment>
                    {Object.entries(details.levels).map(([key, level]) =>
                        <Col key={key}>
                            <h6>{level.label}</h6>
                            <dl>
                                <dt>Hotline</dt>
                                <dd>
                                    <ul className="u-plain-list">
                                        {level.hotline.map((hotlineNumber, index) =>
                                            <li key={`${mainKey}-${key}-number-${index}`}>{hotlineNumber.number}</li>
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
                    <Col>
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