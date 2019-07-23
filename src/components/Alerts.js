import React from 'react'
import { Badge, Button } from 'reactstrap'
import moment from 'moment'
import ReactJson from 'react-json-view'

export default ({alerts,categories ,activeCategories,filterLabels,showModal}) => {

  const activeLabels = {}
  for(let name in filterLabels) { 
    if(filterLabels[name] && filterLabels[name].length>0) activeLabels[name] = filterLabels[name] 
  }

  let items = !activeCategories || !activeCategories.length  ?
    alerts.items // don't filter at all if categories  are empty
    :
    alerts.items.filter(alert => {
      for(let category of activeCategories) {
        const matches = Object.keys(category.match_re).reduce((active, label) => {
          if(!active) return false
          const regex = new RegExp(category.match_re[label])

          return regex.test(alert.labels[label]) 
        }, true)
        if(matches) return true
      }
      return false
    })
    
  if(Object.keys(activeLabels).length >= 0) {
    items = items.filter(alert => {
      for(let name in activeLabels) { 
        if(activeLabels[name].indexOf(alert.labels[name]) < 0) return false
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
          <div className="u-text-info">Silenced by: {status.silencedBy}</div>
          :
          ""
        }
      </React.Fragment>
    )
  }

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
              { severityOrResolved(alert) === "resolved" &&
                  <React.Fragment>
                    <br />
                    <Badge color="success">Resolved</Badge>
                  </React.Fragment>
              }
            </td>
            <td>
              {alert.annotations.summary}
              <br/>
              <small className="u-text-info">{alert.annotations.description}</small>
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
