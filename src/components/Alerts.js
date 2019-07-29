import React from 'react'
import { Badge, Button } from 'reactstrap'
import moment from 'moment'
import ReactJson from 'react-json-view'

const Alerts = ({alerts,categories,labelFilters,showModal}) => {

  const activeLabelFilters = {}
  for(let name in labelFilters) { 
    if(labelFilters[name] && labelFilters[name].length>0) activeLabelFilters[name] = labelFilters[name] 
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

  // get white-listed filter labels, filter out the ones we show in the list anyway, then check each of the remaining ones if they exist on the given alert. If yes render a filter pill for them
  const alertLabels = (alert) => (
    <React.Fragment>
      {Object.keys(labelFilters)
        .filter((label) => /^((?!(\bregion\b|\bseverity\b)).)*$/.test(label))
        .map((labelKey) =>
          alert.labels[labelKey] &&
            <span className="filter-pill" key={labelKey}>{labelKey} = {alert.labels[labelKey]}</span>
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
            Starts At
          </th>
          <th>
            Ends At
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
            <td>{moment(alert.endsAt).format('DD.MM.YYYY HH:mm:ss')}</td>
            <td>{alertStatus(alert.status)}</td>
            <td className="u-v-align-middle"><Button outline size="sm" onClick={() => toggleDetailsModal(alert)}>Raw data</Button></td>
          </tr>
        )}
      </tbody> 
    </table> 
  )
}

export default Alerts
