import React from 'react'
import { Button } from 'reactstrap'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Markup } from 'interweave'

import { useDispatch } from '../lib/globalState'
import AlertActionButtons from './AlertActionButtons'

const AlertLabels = ({labelSettings,labels}) => {
  const dispatch = useDispatch()  

  const isFilterActive = (label, value) => (
    labelSettings[label].findIndex(val => val === value) >= 0
  )
  const handlePillClick = (name, value) => {
    if (isFilterActive(name, value)) {
      dispatch({type: 'REMOVE_FILTER', name, value})          
    } else {
      dispatch({type: 'ADD_FILTER', name, value}) 
    }
  }

  return <React.Fragment>
    {Object.keys(labelSettings).map((labelKey, index) =>
        labels[labelKey] &&
          <span 
            className={`filter-pill ${isFilterActive(labelKey, labels[labelKey]) ? 'active' : ''}`}
            key={ `pill-${labelKey}` } 
            onClick={() => handlePillClick(labelKey, labels[labelKey])}>
            {labelKey} = {labels[labelKey]}
            { isFilterActive(labelKey, labels[labelKey]) &&
              <FontAwesomeIcon icon="times-circle" fixedWidth />
            }
          </span>
    )}
  </React.Fragment>
}

const AlertStatus = ({status,showAckedBy,showSilencedBy,showInhibitedBy,silencesKeyPayload}) => {
  return (
    <React.Fragment>
      {status.state &&
        <div>{status.state}</div>
      }
      {status.inhibitedBy && status.inhibitedBy.length ?
          <div className="u-text-info u-text-small">
            Inhibited by: 
            <Button color="link" className="btn-inline-link" onClick={(e) => {e.preventDefault(); showInhibitedBy(status.inhibitedBy)}}>
              {status.inhibitedBy}
            </Button>
          </div>
        :
        ""
      }
      {status.silencedBy && status.silencedBy.length ?
          <div className="u-text-info u-text-small">
            Silenced by: {silencesKeyPayload[status.silencedBy] 
            ? <Button color="link" className="btn-inline-link" onClick={(e) => {e.preventDefault(); showSilencedBy(status.silencedBy)}}>
                  {silencesKeyPayload[status.silencedBy].createdBy}
                </Button>
            : status.silencedBy
            }
          </div>
        :
        ""
      }
      {status.acknowledgements && status.acknowledgements.length>0 &&
        status.acknowledgements.map((ack,i) => 
          <div className="u-text-info u-text-small" key={i}>
            Acknowledged by: 
            <Button color="link" className="btn-inline-link" onClick={(e) => { e.preventDefault(); showAckedBy(ack)}}>
              {ack.acknowledger.summary}
            </Button>
          </div>
        )          
      }      
    </React.Fragment>
  )
}

const AlertInfoForSmallScreens = ({alert}) => 
  <div className="alert-info-small-screen">
    <span className="u-text-info">{alert.labels.region}</span>
    <span className="u-text-info">{alert.labels.service}</span>
    <span className="u-text-info">{moment(alert.startsAt).format('DD.MM. HH:mm')}</span> 
  </div>
;

const descriptionParsed = (text) => {
  if(!text) return ''
  // urls in descriptions follow the schema: <URL|URL-NAME>
  // Parse description and replace urls with a-tags
  const regexUrl   = /<(http[^>|]+)\|([^>]+)>/g
  const urlParsed  = text.replace(regexUrl, `<a href="$1">$2</a>`)

  // replace text wrapped in *..* by strong tags
  const regexBold  = /\*(.*)\*/g
  const boldParsed = urlParsed.replace(regexBold, `<strong>$1</strong>`)

  const regexCode = /`(.*)`/g
  return boldParsed.replace(regexCode, `<code>$1</code>`)
}

const AlertItem = ({
  alert,visible,labelSettings,silencesKeyPayload,showDetails,
  showInhibitedBy,showSilencedBy,showAckedBy}) => {
  
  if(!visible) return <tr><td colSpan={6}>Loading...</td></tr>  

  return (
    <tr className={alert.labels.severity} >
      <td className="text-nowrap">{alert.labels.region}</td>
      <td>
        {alert.labels.service}
      </td>
      <td className="alert-main u-break-all">
        <AlertInfoForSmallScreens alert={alert}/>
        {alert.annotations.summary}
        <br/>
        <small className="u-text-info">
          <Markup content={descriptionParsed(alert.annotations.description)} tagName="span"/> - {' '}
          <Button className="btn-inline-link" color="link" onClick={(e) => { e.preventDefault(); showDetails()}}>
            Show raw data
          </Button>
        </small>
        <br />
        <AlertLabels labels={alert.labels} labelSettings={labelSettings}/>
      </td>
      <td>{moment(alert.startsAt).format('DD.MM.YYYY HH:mm:ss')}</td>
      <td>
        <AlertStatus 
          status={alert.status} 
          showAckedBy={showAckedBy}
          showSilencedBy={showSilencedBy}
          showInhibitedBy={showInhibitedBy}
          silencesKeyPayload={silencesKeyPayload}/>
      </td>
      <td className="alert-buttons snug">
        <AlertActionButtons alert={alert} />
      </td>
    </tr>
  )
}

export default AlertItem