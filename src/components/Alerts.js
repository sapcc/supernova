import React from 'react'
import { Button } from 'reactstrap'
import moment from 'moment'
import ReactJson from 'react-json-view'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useDispatch } from '../lib/globalState'
import useFilters from '../lib/hooks/useFilters'



const Alerts = ({alerts,categories,labelFilters,showModal, exclusiveFilters}) => {
  exclusiveFilters = exclusiveFilters || {}
  const dispatch = useDispatch()  
  const activeLabelFilters = {}
  const labelSettings = labelFilters.settings
  const {primaryFilters, secondaryFilters} = useFilters(labelSettings)


  for(let name in labelSettings) { 
    if(labelSettings[name] && labelSettings[name].length>0) activeLabelFilters[name] = labelSettings[name] 
  }

  let items = categories.active.length === 0 ?
    alerts.items // don't filter at all if categories  are empty
    :
    alerts.items.filter(alert => {
      for(let category of categories.items) {
        if(!category.active) continue

        const matches = Object.keys(category.match_re).reduce((active, label) => {
          if(!active) return false
          const regex = new RegExp(category.match_re[label])

          return regex.test(alert.labels[label]) 
        }, true)
        if(matches) return true
      }
      return false
    })
    
  if(Object.keys(activeLabelFilters).length >= 0 || Object.keys(exclusiveFilters).length > 0) {
    items = items.filter(alert => {
      // positive filters
      for(let name in activeLabelFilters) { 
        if(activeLabelFilters[name].indexOf(alert.labels[name]) < 0) return false
      }
      // negative filters 
      for(let name in exclusiveFilters) {
        if(exclusiveFilters[name].indexOf(alert.labels[name]) >= 0) return false
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

  const alertStatus = (status) => {
    return (
      <React.Fragment>
        {status.state &&
          <div>{status.state}</div>
        }
        {status.inhibitedBy && status.inhibitedBy.length ?
          <div className="u-text-info">Inhibited by: {status.inhibitedBy}</div>
          :
          ""
        }
        {status.silencedBy && status.silencedBy.length ?
          <div className="u-text-info u-text-small">Silenced by: {status.silencedBy}</div>
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
    if (secondaryFilters.includes(name)) {
      // if the clicked value is a secondary filter ensure that the secondary filter panel is visible
      dispatch({type: 'SET_EXTRA_FILTERS_VISIBLE', visible: true})
    }
    dispatch({type: 'ADD_FILTER', name, value})    
  }

  // get white-listed filter labels, filter out the ones we show in the list anyway, then check each of the remaining ones if they exist on the given alert. If yes render a filter pill for them
  const alertLabels = (alert) => (
    <React.Fragment>
      {secondaryFilters.map((labelKey, index) =>
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
            Severity
          </th>  
          <th>
            Title       
          </th>
          <th>
            Firing since
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
              {alert.labels.severity}
            </td>
            <td>
              {alert.annotations.summary}
              <br/>
              <small className="u-text-info">{alert.annotations.description}</small>
              <br />
              {alertLabels(alert)}
            </td>
            <td>{moment(alert.startsAt).format('DD.MM.YYYY HH:mm:ss')}</td>
            <td>{alertStatus(alert.status)}</td>
            <td className="u-v-align-middle"><Button outline size="sm" onClick={() => toggleDetailsModal(alert)}>Raw data</Button></td>
          </tr>
        )}
      </tbody> 
    </table> 
  )
}

export default Alerts
