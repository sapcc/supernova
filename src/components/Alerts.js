import React, {useMemo} from 'react'
import { Button } from 'reactstrap'
import moment from 'moment'
import ReactJson from 'react-json-view'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Markup } from 'interweave'

import { useDispatch } from '../lib/globalState'
import AlertActionButtons from './AlertActionButtons'

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

  const toggleDetailsModal = (alert) => 
    showModal({
      header: <React.Fragment>Raw Data for <span className="u-text-info">&quot;{alert.annotations.summary}&quot;</span></React.Fragment>,
      body: <ReactJson src={alert} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  
  const toggleSilenceModal = (e,silenceId) => {
    e.preventDefault()
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
  
  const toggleAckedModal = (e,payload) => { 
    e.preventDefault()
    showModal({
      header: <React.Fragment>Acknowledgement</React.Fragment>,
      body: <ReactJson src={payload} collapsed={2} collapseStringsAfterLength={100} />,
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
            <div className="u-text-info u-text-small">
              Inhibited by: 
              <Button color="link" className="btn-inline-link" onClick={() => toggleInhibitedModal(status.inhibitedBy)}>
                {status.inhibitedBy}
              </Button>
            </div>
          :
          ""
        }
        {status.silencedBy && status.silencedBy.length ?
            <div className="u-text-info u-text-small">
              Silenced by: {silencesKeyPayload[status.silencedBy] 
              ? <Button color="link" className="btn-inline-link" onClick={(e) => toggleSilenceModal(e,status.silencedBy)}>
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
              <Button color="link" className="btn-inline-link" onClick={(e) => toggleAckedModal(e,ack)}>
                {ack.acknowledger.summary}
              </Button>
            </div>
          )          
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
  const alertLabels = (alert) => {
    return <React.Fragment>
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
  }

  const descriptionParsed = (description) => {
    // urls in descriptions follow the schema: <URL|URL-NAME>
    const regex = /<(http[^>|]+)\|([^>]+)>/g
    const subst = `<a href="$1">$2</a>`
    // Parse description and replace urls with a-tags
    return description.replace(regex, subst);
  }


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
          <tr key={index} className={alert.labels.severity} >
            <td className="text-nowrap">{alert.labels.region}</td>
            <td>
              {alert.labels.service}
            </td>
            <td>
              {alert.annotations.summary}
              <br/>
              <small className="u-text-info"><Markup content={descriptionParsed(alert.annotations.description)} tagName="span"/> - <Button className="btn-inline-link" color="link" onClick={() => toggleDetailsModal(alert)}>Show raw data</Button></small>
              <br />
              {alertLabels(alert)}
            </td>
            <td>{moment(alert.startsAt).format('DD.MM.YYYY HH:mm:ss')}</td>
            <td>{alertStatus(alert.status)}</td>
            <td className="snug">
              <AlertActionButtons alert={alert} />
            </td>
          </tr>
        )}
      </tbody> 
    </table> 
  )
}

export default Alerts
