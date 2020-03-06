import React from 'react'
import { Container, Row, Col } from 'reactstrap'


const ContactsDetailsList = ({mainKey, details}) => {

    return (
        <Container fluid={true}>
            <Row>
                { details && details.levels && Object.entries(details.levels).map(([key, level]) =>
                    <Col >
                        <div>{level.label}</div>
                        <div>
                            {level.hotline.map((hotlineNumber, index) =>
                                <div key={`${mainKey}-${key}-number-${index}`}>{hotlineNumber.number}</div>
                            )}
                        </div>
                        <div>{level.spc_queue}</div>
                        <div>{level.team_dl}</div>
                        <div>{level.operational_lead}</div>
                        <div>{level.accountable_manager}</div>
                    </Col>
                )}   
            </Row>
        </Container>
    )
}

export default ContactsDetailsList