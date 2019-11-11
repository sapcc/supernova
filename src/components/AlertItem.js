import React, { useMemo } from 'react'
import { Button } from 'reactstrap'
import moment from 'moment'
import { Markup } from 'interweave'

import AlertActionButtons from './AlertActionButtons'
import AlertLinks from './AlertLinks'
import AlertLabels from './shared/AlertLabels'
import AlertStatus from './shared/AlertStatus'
import { descriptionParsed } from '../lib/utilities'

moment.updateLocale('en', {
  relativeTime : {
      future: "in %s",
      past:   "%s ago",
      s  : 'a few sec',
      ss : '%d sec',
      m:  "1 min",
      mm: "%d min",
      h:  "1 hour",
      hh: "%d hours",
      d:  "1 day",
      dd: "%d days",
      M:  "1 month",
      MM: "%d months",
      y:  "1 year",
      yy: "%d years"
  }
});

const AlertInfoForSmallScreens = ({alert}) => 
  <div className="alert-info-small-screen">
    <span className="u-text-info">{alert.labels.region}</span>
    <span className="u-text-info">{alert.labels.service}</span>
    <span className="u-text-info">{moment(alert.startsAt).format('DD.MM. HH:mm')}</span> 
  </div>
;

const AlertItem = React.memo(({
  alert,visible,labelSettings,silencesKeyPayload,showDetails,
  showInhibitedBy,showSilencedBy,showAckedBy,createSilence}) => {
  
  if(!visible) return <tr><td colSpan={6}>Loading...</td></tr>  

  const silences = useMemo(() => {
    if(!alert.status || !alert.status.silencedBy) return []
    let silenceIds = alert.status.silencedBy
    if(!Array.isArray(silenceIds)) silenceIds = [silenceIds]
    return silenceIds.map(id => ( {id, silence: silencesKeyPayload[id]} ))
  },[alert.status,silencesKeyPayload])

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
            Show details
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
          silences={silences}/>
      </td>
      <td className="alert-buttons snug">
        <AlertActionButtons alert={alert} createSilence={createSilence}/>
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