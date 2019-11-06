import React, {useState, useMemo} from 'react'
import ReactJson from 'react-json-view'
import { Markup } from 'interweave'
import classnames from 'classnames'
import { Nav, NavItem, NavLink, TabContent, TabPane, Table } from 'reactstrap'

import AlertActionButtons from './AlertActionButtons'
import AlertLinks from './AlertLinks'
import AlertLabels from './shared/AlertLabels'
import AlertStatus from './shared/AlertStatus'
import { descriptionParsed, silences } from '../lib/utilities'


const AlertDetails = ({alert, labelSettings, silencesKeyPayload, showInhibitedBy, showSilencedBy, showAckedBy, activeTabSelection, createSilence}) => {

  if (!activeTabSelection) {
    activeTabSelection = 'details'
  }
  
  const [activeTab, setActiveTab] = useState(activeTabSelection);

  const toggle = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }

  const silences = useMemo(() => {
    if(!alert.status || !alert.status.silencedBy) return []
    let silenceIds = alert.status.silencedBy
    if(!Array.isArray(silenceIds)) silenceIds = [silenceIds]
    return silenceIds.map(id => ( {id, silence: silencesKeyPayload[id]} ))
  },[alert.status,silencesKeyPayload])

  return (
    <div className={`alert-details ${alert.labels.severity}`}>
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'details' })}
            onClick={() => { toggle('details'); }}>
            Details
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'raw' })}
            onClick={() => { toggle('raw'); }}>
            Raw Data
          </NavLink>
        </NavItem>
      </Nav>


      {/* TAB 1 */}

      <TabContent activeTab={activeTab}>
        <TabPane tabId="details">
          <Table borderless>
            <tbody>
              <tr>
                <th>
                  Region
                </th>
                <td>
                  {alert.labels.region}
                </td>
              </tr>

              <tr>
                <th>
                  Severity
                </th>
                <td>
                  {alert.labels.severity}
                </td>
              </tr>

              <tr>
                <th>
                  Service
                </th>
                <td>
                  {alert.labels.service}
                </td>
              </tr>

              <tr>
                <th>
                  Description
                </th>
                <td>
                  <Markup content={descriptionParsed(alert.annotations.description)} tagName="span"/>
                </td>
              </tr>

              <tr>
                <th>
                  Labels
                </th>
                <td>
                  <AlertLabels labels={alert.labels} labelSettings={labelSettings}/>
                </td>
              </tr>

              <tr>
                <th>
                  Status
                </th>
                <td>
                  <AlertStatus 
                  status={alert.status} 
                  showAckedBy={showAckedBy}
                  showSilencedBy={showSilencedBy}
                  showInhibitedBy={showInhibitedBy}
                  silences={silences}
                  />
                </td>
              </tr>

              <tr>
                <th>
                  Links
                </th>
                <td>
                  <AlertLinks alert={alert} />
                </td>
              </tr>

              <tr>
                <td colSpan="2">
                  <AlertActionButtons alert={alert} createSilence={createSilence} />
                </td>
              </tr>
            </tbody>
          </Table>

        </TabPane>
      </TabContent>



      {/* TAB 2 */}

      <TabContent activeTab={activeTab}>
        <TabPane tabId="raw">
          <ReactJson src={alert} collapsed={2} collapseStringsAfterLength={100} />
        </TabPane>
      </TabContent>
      
    </div>
  )
}

export default AlertDetails