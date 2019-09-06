import React, {useMemo} from 'react'
import { Button } from 'reactstrap'
import moment from 'moment'
import ReactJson from 'react-json-view'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useDispatch } from '../lib/globalState'

const Alerts = ({alerts,silences,categories,labelFilters,showModal}) => {

  const dispatch = useDispatch()  
  const activeLabelFilters = {}
  const labelSettings = labelFilters.settings
  const activeCategories = useMemo(() => categories.items.filter(c => c.active), [categories.items])
  const silencesKeyPayload = useMemo(() => 
    silences.items.reduce((hash,silence) => {hash[silence.id] = silence; return hash}, {})
    , [silences.items]
  )

  for(let name in labelSettings) { 
    if(labelSettings[name] && labelSettings[name].length>0) activeLabelFilters[name] = labelSettings[name] 
  }

  let items = useMemo(() => {
    // don't filter at all if categories are empty
    if(categories.active.length === 0) return alerts.items
    
    return alerts.items.filter(alert => {
      return activeCategories.reduce((matchesOtherCategories,category) => {
        return matchesOtherCategories && Object.keys(category.match_re).reduce((matchesOtherLabels,label) => {
          const regex = new RegExp(category.match_re[label])
          return matchesOtherLabels && regex.test(alert.labels[label]) 
        },true)
      },true)
    })
  }, [alerts,categories,activeCategories])
    
  if(Object.keys(activeLabelFilters).length >= 0) {
    items = items.filter(alert => {
      for(let name in activeLabelFilters) { 
        if(activeLabelFilters[name].indexOf(alert.labels[name]) < 0) return false
      }
      return true
    })
  }

  const severityOrResolved = (alert) => {
    // console.log(alert);
    if (moment(alert.endsAt).valueOf() < Date.now()) {
      return "resolved"
    } else {
      return alert.labels.severity
    }
  }

  const toggleDetailsModal = (alert) => 
    showModal({
      header: <React.Fragment>Raw Data for <span className="u-text-info">&quot;{alert.annotations.summary}&quot;</span></React.Fragment>,
      body: <ReactJson src={alert} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  
  const toggleSilenceModal = (silenceId) => { 
    if(!silencesKeyPayload[silenceId]) return
    showModal({
      header: <React.Fragment>Silence</React.Fragment>,
      body: <ReactJson src={silencesKeyPayload[silenceId]} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  }

  const toggleInhibitedModal = (fingerprint) => { 
    if(Array.isArray(fingerprint)) fingerprint = fingerprint[0]
    const alert = alerts.items.find(a => a.fingerprint === fingerprint)
    if(!alert) return
    showModal({
      header: <React.Fragment>Alert</React.Fragment>,
      body: <ReactJson src={alert} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  }

  const alertStatus = (status) => {
    return (
      <React.Fragment>
        {status.state &&
          <div>{status.state}</div>
        }
        {status.inhibitedBy && status.inhibitedBy.length ?
            <div className="u-text-info">Inhibited by: <a href="javascript:void(0)" onClick={() => toggleInhibitedModal(status.inhibitedBy)}>{status.inhibitedBy}</a></div>
          :
          ""
        }
        {status.silencedBy && status.silencedBy.length ?
            <div className="u-text-info u-text-small">
              Silenced by: {silencesKeyPayload[status.silencedBy] 
                  ? <span>
                    <br/>
                      <a href="javascript:void(0)"  onClick={() => toggleSilenceModal(status.silencedBy)}>
                        {silencesKeyPayload[status.silencedBy].createdBy}
                      </a>
                      <br/>
                        
                    </span>    
                  : status.silencedBy
              }
            </div>
          :
          ""
        }
      </React.Fragment>
    )
  }

  const isFilterActive = (label, value) => (
    labelSettings[label].findIndex(val => val === value) >= 0
  )

  const handlePillClick = (name, value) => {
    if (isFilterActive(name, value)) {
      dispatch({type: 'REMOVE_FILTER', name, value})          
    } else {
      addFilter(name, value)
    }
  }

  const addFilter = (name, value) => {
    dispatch({type: 'ADD_FILTER', name, value})    
  }

  // get white-listed filter labels, filter out the ones we show in the list anyway, then check each of the remaining ones if they exist on the given alert. If yes render a filter pill for them
  const alertLabels = (alert) => (
    <React.Fragment>
      {Object.keys(labelSettings).map((labelKey, index) =>
          alert.labels[labelKey] &&
            <span 
              className={`filter-pill ${isFilterActive(labelKey, alert.labels[labelKey]) ? 'active' : ''}`}
              key={ `pill-${labelKey}` } 
              onClick={() => handlePillClick(labelKey, alert.labels[labelKey])}>
              {labelKey} = {alert.labels[labelKey]}
              { isFilterActive(labelKey, alert.labels[labelKey]) &&
                <FontAwesomeIcon icon="times-circle" fixedWidth />
              }
            </span>
      )}
    </React.Fragment>
  )


  return (
    <table className="table table-main">
      <thead>
        <tr>
          <th>
            Region
          </th>  
          <th> 
            Service
          </th>  
          <th>
            Title       
          </th>
          <th className="text-nowrap">
            Firing Since
          </th>
          <th>
            Status
          </th>
          <th></th>
        </tr>  
      </thead>
      <tbody>
        {/* IF NO ALERTS -> YAY */}
        {items.map((alert,index) =>
          <tr key={index} className={severityOrResolved(alert)} >
            <td className="text-nowrap">{alert.labels.region}</td>
            <td>
              {alert.labels.service}
            </td>
            <td>
              {alert.annotations.summary}
              <br/>
              <small className="u-text-info">{alert.annotations.description} - <Button className="btn-inline-link" color="link" onClick={() => toggleDetailsModal(alert)}>Show raw data</Button></small>
              <br />
              {alertLabels(alert)}
            </td>
            <td>{moment(alert.startsAt).format('DD.MM.YYYY HH:mm:ss')}</td>
            <td>{alertStatus(alert.status)}</td>
            <td></td>
          </tr>
        )}
      </tbody> 
    </table> 
  )
}

export default Alerts
