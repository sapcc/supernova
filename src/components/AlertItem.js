import React from 'react'
import { Button } from 'reactstrap'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Markup } from 'interweave'

import { useDispatch } from '../lib/globalState'
import AlertActionButtons from './AlertActionButtons'
import AlertLinks from './AlertLinks'

moment.updateLocale('en', {
  relativeTime : {
      future: "in %s",
      past:   "%s ago",
      s  : 'a few sec',
      ss : '%d sec',
      m:  "a min",
      mm: "%d min",
      h:  "an hour",
      hh: "%d hours",
      d:  "a day",
      dd: "%d days",
      M:  "a month",
      MM: "%d months",
      y:  "a year",
      yy: "%d years"
  }
});

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

const AlertStatus = ({status, showAckedBy,showSilencedBy,showInhibitedBy,silencesKeyPayload}) => {
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
      {status.pagerDutyInfos && status.pagerDutyInfos.acknowledgements &&  status.pagerDutyInfos.acknowledgements.length>0 &&
        <React.Fragment>
          <div className="u-text-info u-text-small">Acked By:</div>
          {status.pagerDutyInfos.acknowledgements.map((ack,i) => ack.user.name !== 'CC Supernova' && 
            <div className="u-text-info u-text-small" key={i}>
              <Button color="link" className="btn-inline-link" onClick={(e) => { e.preventDefault(); showAckedBy(ack)}}>
                {ack.user.name || ack.user.email}
              </Button>
              <span className="u-nowrap">{' '}{moment(ack.at).fromNow(true)}</span>
            </div>
          )}          
          </React.Fragment>
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

const AlertItem = React.memo(({
  alert,visible,labelSettings,silencesKeyPayload,showDetails,
  showInhibitedBy,showSilencedBy,showAckedBy}) => {
  
  if(!visible) return <tr><td colSpan={6}>Loading...</td></tr>  

  return (
    <tr className={alert.labels.severity} >
      <td className="text-nowrap">
        {alert.labels.region}
        { alert.labels.region !== alert.labels.cluster &&
          <React.Fragment>
            <br />
            <span className="u-text-info">{alert.labels.cluster}</span>
          </React.Fragment>
        }
      </td> 
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
          <AlertLinks alert={alert} />
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
},(oldProps,newProps) => {
  const identical = oldProps.alert === newProps.alert && 
                    oldProps.visible === newProps.visible && 
                    oldProps.labelSettings === newProps.labelSettings && 
                    oldProps.silencesKeyPayload === newProps.silencesKeyPayload
  return identical                  
})

export default AlertItem