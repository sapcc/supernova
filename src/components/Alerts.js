import React, {useMemo,useState,useRef} from 'react'
import ReactJson from 'react-json-view'
import AlertItem from './AlertItem'

const Alerts = React.memo(({alerts,silences,categories,labelFilters,showModal}) => {
  const tableElement = useRef(null)
  const labelSettings = labelFilters.settings
  const activeCategories = useMemo(() => categories.items.filter(c => c.active), [categories.items])
  const silencesKeyPayload = useMemo(() => 
    silences.items.reduce((hash,silence) => {hash[silence.id] = silence; return hash}, {})
    , [silences.items]
  )
  const activeLabelFilters = useMemo(() => {
    const result = {}
    for(let name in labelSettings) { 
      if(labelSettings[name] && labelSettings[name].length>0) result[name] = labelSettings[name] 
    }
    return result
  },[labelSettings])

  const pageSize = 100
  const [page,setPage] = useState(1)

  // collect fingerprints of visible alerts
  // returns a hash
  let filteredAlerts = useMemo(() => {
    // don't filter at all if categories are empty
    if(categories.active.length === 0) return []

    console.log('----',activeLabelFilters)
    return alerts.items.filter(alert => {
      let visible = activeCategories.reduce((matchesOtherCategories,category) => {
        return matchesOtherCategories && Object.keys(category.match_re).reduce((matchesOtherLabels,label) => {
          const regex = new RegExp(category.match_re[label])
          return matchesOtherLabels && regex.test(alert.labels[label]) 
        },true)
      },true)


      if(visible && Object.keys(activeLabelFilters).length >= 0) {
        for(let name in activeLabelFilters) { 
          if(activeLabelFilters[name].indexOf(alert.labels[name]) < 0) visible = false
        }
      }
      
      return visible
    })
  },[alerts,categories,activeCategories,activeLabelFilters])

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
  
  const toggleAckedModal = (payload) => { 
    showModal({
      header: <React.Fragment>Acknowledgement</React.Fragment>,
      body: <ReactJson src={payload} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  }

  return (
    alerts.isLoading 
    ? <span>Loading...</span> 
    :  
    <React.Fragment>
      <table className="alerts table table-main" ref={tableElement}>
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
          {filteredAlerts.slice(0,page*pageSize).map((alert,index) => 
            //index >= start && index <= end && 
            <AlertItem 
              key={alert.fingerprint}
              alert={alert}
              visible={true}
              labelSettings={labelSettings}
              silencesKeyPayload={silencesKeyPayload}
              showDetails={() => toggleDetailsModal(alert)}
              showInhibitedBy={(fingerprint) => toggleInhibitedModal(fingerprint) }
              showSilencedBy={(silenceId) => toggleSilenceModal(silenceId)}
              showAckedBy={(payload) => toggleAckedModal(payload)}
            />
          )}
        </tbody> 
      </table> 
      {page*pageSize < filteredAlerts.length && 
        <nav aria-label="Alerts navigation">
          <ul className="pagination justify-content-end">
            <li className="page-item">
              <button className="page-link" tabIndex="-1" onClick={(e) => {e.preventDefault(); setPage(page+1)}}>
                Load next
              </button>
            </li>
          </ul>
        </nav>
      } 
    </React.Fragment>  
  )
},(oldProps,newProps) => {
  console.log('::::',newProps)
  // speedup
  // do not re-render table if no changes
  const identical = oldProps.alerts.updatedAt === newProps.alerts.updatedAt && 
         oldProps.silences.updatedAt === newProps.silences.updatedAt && 
         oldProps.categories === newProps.categories &&
         oldProps.labelFilters === newProps.labelFilters
  return identical     
})

export default Alerts
