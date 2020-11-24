import React, { useState, useEffect } from "react"
import ReactJson from "react-json-view"
import { Markup } from "interweave"
import classnames from "classnames"
import {
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
} from "reactstrap"

import { useDispatch } from "../lib/globalState"
import useSilences from "../lib/hooks/useSilences"
import AlertActionButtons from "./AlertActionButtons"
import AlertLinks from "./AlertLinks"
import AlertLabels from "./shared/AlertLabels"
import AlertStatus from "./shared/AlertStatus"
import ContactList from "./display/contacts"
import { descriptionParsed } from "../lib/utilities"

const AlertDetails = ({
  alert,
  labelSettings,
  silencesKeyPayload,
  showInhibitedBy,
  showSilencedBy,
  showAckedBy,
  activeTabSelection,
  createSilence,
  Body,
  Buttons,
  hide,
}) => {
  const dispatch = useDispatch()

  // set show target onMount, unset on hide
  useEffect(() => {
    dispatch({ type: "SET_SHOW_TARGET", showTarget: alert.fingerprint })

    return () => dispatch({ type: "SET_SHOW_TARGET", showTarget: null })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!activeTabSelection) {
    activeTabSelection = "details"
  }

  const [activeTab, setActiveTab] = useState(activeTabSelection)

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const silences = useSilences(alert.status, silencesKeyPayload)

  return (
    <React.Fragment>
      <Body className="alert-details">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "details" })}
              onClick={() => {
                toggle("details")
              }}
            >
              Details
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "raw" })}
              onClick={() => {
                toggle("raw")
              }}
            >
              Raw Data
            </NavLink>
          </NavItem>
          {alert.labels.support_component && (
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "support" })}
                onClick={() => {
                  toggle("support")
                }}
              >
                Support Channels
              </NavLink>
            </NavItem>
          )}
        </Nav>

        {/* TAB DETAILS */}

        <TabContent activeTab={activeTab}>
          <TabPane tabId="details" className="alert-detail-tab">
            <Row>
              <Col md="2" className="heading">
                Name
              </Col>
              <Col md="10">{alert.labels?.alertname}</Col>
            </Row>
            <Row>
              <Col md="2" className="heading">
                Region
              </Col>
              <Col md="10">{alert.labels.region}</Col>
            </Row>

            <Row>
              <Col md="2" className="heading">
                Severity
              </Col>
              <Col md="10">{alert.labels.severity}</Col>
            </Row>

            <Row>
              <Col md="2" className="heading">
                Service
              </Col>
              <Col md="10">{alert.labels.service}</Col>
            </Row>

            <Row>
              <Col md="2" className="heading">
                Description
              </Col>
              <Col md="10">
                <Markup
                  content={descriptionParsed(alert.annotations.description)}
                  tagName="span"
                />
              </Col>
            </Row>

            <Row>
              <Col md="2" className="heading">
                Labels
              </Col>
              <Col md="10">
                <AlertLabels
                  labels={alert.labels}
                  labelSettings={labelSettings}
                />
              </Col>
            </Row>

            <Row>
              <Col md="2" className="heading">
                Status
              </Col>
              <Col md="10">
                <AlertStatus
                  status={alert.status}
                  showAckedBy={showAckedBy}
                  showSilencedBy={showSilencedBy}
                  showInhibitedBy={showInhibitedBy}
                  silences={silences}
                />
              </Col>
            </Row>

            <Row>
              <Col md="2" className="heading">
                Links
              </Col>
              <Col md="10">
                <AlertLinks alert={alert} />
              </Col>
            </Row>
          </TabPane>
        </TabContent>

        {/* TAB RAW VIEW */}

        <TabContent activeTab={activeTab}>
          <TabPane tabId="raw">
            <ReactJson
              src={alert}
              collapsed={2}
              collapseStringsAfterLength={100}
            />
          </TabPane>
        </TabContent>

        {/* TAB Support Channels Info */}
        {alert.labels.support_component && (
          <TabContent activeTab={activeTab}>
            <TabPane tabId="support">
              <ContactList
                visible={true}
                componentKey={alert.labels.support_component}
              />
            </TabPane>
          </TabContent>
        )}
      </Body>

      <Buttons>
        <AlertActionButtons
          alert={alert}
          createSilence={createSilence}
          containerClasses={alert.labels.severity}
        />
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
      </Buttons>
    </React.Fragment>
  )
}

export default AlertDetails
